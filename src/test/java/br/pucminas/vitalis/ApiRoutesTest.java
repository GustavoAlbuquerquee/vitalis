package br.pucminas.vitalis;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.net.URI;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ApiRoutesTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void recursosDaSprintDoisEstaoDisponiveisNoPrefixoDaAplicacao() throws Exception {
        mvc.perform(get("/profissionais")).andExpect(status().isOk());
        mvc.perform(get("/internacoes")).andExpect(status().isOk());
        mvc.perform(get("/quartos")).andExpect(status().isOk());
        mvc.perform(get("/procedimentos-cirurgicos")).andExpect(status().isOk());
    }

    @Test
    void localizacoesDeCriacaoNaoRepetemPrefixoNemRecurso() throws Exception {
        MvcResult profissional = mvc.perform(post("/profissionais")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tipo\":\"CLINICO_GERAL\",\"nome\":\"Clinico\",\"registroProfissional\":\"CRM-TESTE-1\",\"telefone\":\"31999999999\",\"email\":\"clinico@teste.com\"}"))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andReturn();
        assertTrue(URI.create(profissional.getResponse().getHeader("Location")).getPath()
                .matches("/profissionais/\\d+"));

        MvcResult quarto = mvc.perform(post("/quartos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"numero\":\"T-101\",\"andar\":1,\"capacidadeMaxima\":2,\"tipo\":\"ENFERMARIA\"}"))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andReturn();
        assertTrue(URI.create(quarto.getResponse().getHeader("Location")).getPath()
                .matches("/quartos/\\d+"));
    }
}
