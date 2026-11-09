package br.pucminas.vitalis.consultas.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("demo")
@Import(ConsultaApiTest.RelogioTeste.class)
class EmergenciaApiTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;

    private ObjectNode emergencia() {
        return mapper.createObjectNode().put("modalidade", "EMERGENCIA").put("pacienteId", 1)
                .put("profissionalId", 1).put("motivo", "Urgência").put("prioridade", "CRITICA");
    }

    private ResultActions postar(ObjectNode dados) throws Exception {
        return mvc.perform(post("/consultas").contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(dados)));
    }

    @Test void emergenciaForaDaDisponibilidadePodeIniciarSemConfirmacao() throws Exception {
        MvcResult criada = postar(emergencia()).andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("AGUARDANDO"))
                .andExpect(jsonPath("$.chegada").value("2030-01-01T07:00:00")).andReturn();
        long id = mapper.readTree(criada.getResponse().getContentAsString()).get("id").asLong();
        mvc.perform(get("/consultas").param("modalidade", "EMERGENCIA").param("status", "AGUARDANDO"))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].prioridade").value("CRITICA"));
        mvc.perform(patch("/consultas/{id}/inicio", id)).andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("EM_ATENDIMENTO"));
        mvc.perform(patch("/consultas/{id}/conclusao", id).contentType(MediaType.APPLICATION_JSON)
                .content("{\"observacoes\":\"Avaliado\"}")).andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONCLUIDA"));
        mvc.perform(get("/consultas").param("modalidade", "EMERGENCIA").param("status", "AGUARDANDO"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(get("/consultas").param("modalidade", "EMERGENCIA").param("status", "CONCLUIDA"))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(id));
    }

    @Test void rejeitaEnumsInvalidosAgendamentoEEstadoInjetado() throws Exception {
        ObjectNode semPrioridade = emergencia();
        semPrioridade.remove("prioridade");
        postar(semPrioridade).andExpect(status().isBadRequest());
        postar(emergencia().put("prioridade", "MUITO_ALTA")).andExpect(status().isBadRequest());
        postar(emergencia().put("prioridade", 3)).andExpect(status().isBadRequest());
        postar(emergencia().put("data", "2030-01-01")).andExpect(status().isBadRequest());
        postar(emergencia().put("status", "CONCLUIDA")).andExpect(status().isBadRequest());
        postar(emergencia().put("chegada", "2020-01-01T00:00:00")).andExpect(status().isBadRequest());
        mvc.perform(get("/consultas").param("status", "AGUARDANDO")).andExpect(status().isBadRequest());
    }
}
