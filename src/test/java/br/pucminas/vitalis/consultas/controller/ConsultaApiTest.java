package br.pucminas.vitalis.consultas.controller;

import br.pucminas.vitalis.consultas.dto.CriarConsultaRequest;
import br.pucminas.vitalis.consultas.service.ConsultaService;
import br.pucminas.vitalis.comum.service.ConflitoDeHorarioException;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.*;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.*;
import java.time.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("demo")
@Import(ConsultaApiTest.RelogioTeste.class)
class ConsultaApiTest {
    @TestConfiguration static class RelogioTeste {
        @Bean @Primary Clock relogioTeste() {
            return Clock.fixed(Instant.parse("2030-01-01T10:00:00Z"), ZoneId.of("America/Sao_Paulo"));
        }
    }

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired ConsultaService service;

    private ObjectNode rotina(String data) {
        return mapper.createObjectNode().put("modalidade", "ROTINA").put("pacienteId", 1)
                .put("profissionalId", 1).put("data", data).put("horario", "10:00")
                .put("duracaoMinutos", 30).put("motivo", "Retorno");
    }

    private ResultActions postar(ObjectNode dados) throws Exception {
        return mvc.perform(post("/consultas").contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(dados)));
    }

    private long criar(ObjectNode dados) throws Exception {
        MvcResult resposta = postar(dados).andExpect(status().isCreated())
                .andExpect(header().exists("Location")).andReturn();
        return mapper.readTree(resposta.getResponse().getContentAsString()).get("id").asLong();
    }

    @Test void cicloCompletoPreservaObservacoesERecusaRetorno() throws Exception {
        long id = criar(rotina("2030-01-07"));
        mvc.perform(patch("/consultas/{id}/inicio", id)).andExpect(status().isConflict());
        mvc.perform(patch("/consultas/{id}/confirmacao", id))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("CONFIRMADA"));
        mvc.perform(patch("/consultas/{id}/inicio", id))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("EM_ATENDIMENTO"));
        mvc.perform(patch("/consultas/{id}/conclusao", id).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"observacoes\":\"Paciente avaliado\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("CONCLUIDA"))
                .andExpect(jsonPath("$.observacoes").value("Paciente avaliado"));
        mvc.perform(patch("/consultas/{id}/confirmacao", id))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.codigo").value("TRANSICAO_INVALIDA"));
        mvc.perform(get("/consultas/{id}", id)).andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONCLUIDA"));
    }

    @Test void cancelarPreservaRegistroELiberaHorario() throws Exception {
        ObjectNode dados = rotina("2030-01-08");
        long id = criar(dados);
        postar(dados).andExpect(status().isConflict()).andExpect(jsonPath("$.codigo").value("CONFLITO_DE_HORARIO"));
        mvc.perform(delete("/consultas/{id}", id)).andExpect(status().isNoContent());
        mvc.perform(get("/consultas/{id}", id)).andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELADA"));
        mvc.perform(patch("/consultas/{id}/conclusao", id).contentType(MediaType.APPLICATION_JSON)
                .content("{}")).andExpect(status().isConflict());
        criar(dados);
    }

    @Test void especializadaRetorna409ParaAreaIncompativel() throws Exception {
        ObjectNode dados = rotina("2030-01-09").put("modalidade", "ESPECIALIZADA")
                .put("especialidade", "NEUROLOGIA");
        postar(dados).andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("ESPECIALIDADE_INCOMPATIVEL"));
        dados.put("especialidade", "CARDIOLOGIA");
        criar(dados);
        postar(rotina("2030-01-09")).andExpect(status().isConflict());
    }

    @Test void filtrosCombinadosEFalta() throws Exception {
        long id = criar(rotina("2030-01-10"));
        mvc.perform(patch("/consultas/{id}/nao-comparecimento", id)).andExpect(status().isOk());
        mvc.perform(get("/consultas").param("data", "2030-01-10").param("pacienteId", "1")
                        .param("profissionalId", "1").param("status", "NAO_COMPARECEU").param("modalidade", "ROTINA"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(id));
        mvc.perform(get("/consultas").param("pacienteId", "999")).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
        mvc.perform(get("/consultas").param("status", "inventado")).andExpect(status().isBadRequest());
    }

    @Test void validaFormatoObrigatoriosPassadoEDisponibilidade() throws Exception {
        postar(mapper.createObjectNode()).andExpect(status().isBadRequest());
        postar(rotina("2029-12-31")).andExpect(status().isBadRequest());
        postar(rotina("2030-01-11").put("duracaoMinutos", 0)).andExpect(status().isBadRequest());
        postar(rotina("2030-01-11").put("horario", "17:45")).andExpect(status().isConflict());
        postar(rotina("2030-01-11").put("pacienteId", 99)).andExpect(status().isNotFound());
        postar(rotina("2030-01-11").put("profissionalId", 99)).andExpect(status().isNotFound());
        mvc.perform(get("/consultas/99999")).andExpect(status().isNotFound());
        ObjectNode semHorario = rotina("2030-01-11");
        semHorario.remove("horario");
        postar(semHorario).andExpect(status().isBadRequest());
    }

    @Test void duasCriacoesConcorrentesNaoReservamMesmoHorario() throws Exception {
        CriarConsultaRequest dados = mapper.treeToValue(rotina("2030-01-12"), CriarConsultaRequest.class);
        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch pronto = new CountDownLatch(2);
        CountDownLatch iniciar = new CountDownLatch(1);
        Callable<Boolean> criar = () -> {
            pronto.countDown();
            if (!iniciar.await(5, TimeUnit.SECONDS)) throw new IllegalStateException("Tempo excedido");
            try { service.criar(dados); return true; }
            catch (ConflitoDeHorarioException esperado) { return false; }
        };
        try {
            Future<Boolean> a = executor.submit(criar);
            Future<Boolean> b = executor.submit(criar);
            assertTrue(pronto.await(5, TimeUnit.SECONDS));
            iniciar.countDown();
            assertNotEquals(a.get(10, TimeUnit.SECONDS), b.get(10, TimeUnit.SECONDS));
        } finally { iniciar.countDown(); executor.shutdownNow(); }
    }
}
