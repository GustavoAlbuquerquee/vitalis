package br.pucminas.vitalis.comum.controller;

import br.pucminas.vitalis.comum.service.CapacidadeExcedidaException;
import br.pucminas.vitalis.comum.service.DadosInvalidosException;
import br.pucminas.vitalis.comum.service.RecursoNaoEncontradoException;
import br.pucminas.vitalis.comum.service.TransicaoInvalidaException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import java.util.Collections;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class GlobalExceptionHandlerTest {

    private MockMvc mockMvc;

    @BeforeEach
    public void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new TestController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    public void deveTraduzirDadosInvalidosPara400() throws Exception {
        mockMvc.perform(get("/teste/400"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("DADOS_INVALIDOS"))
                .andExpect(jsonPath("$.detalhes[0]").value("nome: obrigatório"));
    }

    @Test
    public void deveTraduzirFalhaDeBeanValidationPara400() throws Exception {
        mockMvc.perform(post("/teste/validacao")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("DADOS_INVALIDOS"))
                .andExpect(jsonPath("$.detalhes[0]").value("nome: obrigatório"));
    }

    @Test
    public void deveTraduzirRecursoNaoEncontradoPara404() throws Exception {
        mockMvc.perform(get("/teste/404"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("RECURSO_NAO_ENCONTRADO"));
    }

    @Test
    public void deveTraduzirRegraDeNegocioPara409() throws Exception {
        mockMvc.perform(get("/teste/409"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("CAPACIDADE_EXCEDIDA"));
    }

    @Test
    public void deveTraduzirTransicaoInvalidaPara422() throws Exception {
        mockMvc.perform(get("/teste/422"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.codigo").value("TRANSICAO_INVALIDA"));
    }

    @Test
    public void deveOcultarDetalhesDeErroInterno() throws Exception {
        mockMvc.perform(get("/teste/500"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.codigo").value("ERRO_INTERNO"))
                .andExpect(jsonPath("$.mensagem", not(containsString("SELECT"))))
                .andExpect(jsonPath("$.detalhes").isEmpty());
    }

    @RestController
    static class TestController {

        @GetMapping("/teste/400")
        public void dadosInvalidos() {
            throw new DadosInvalidosException(
                    Collections.singletonMap("nome", "obrigatório"));
        }

        @PostMapping("/teste/validacao")
        public void validar(@Valid @RequestBody DadosDeEntrada dados) {
        }

        @GetMapping("/teste/404")
        public void recursoNaoEncontrado() {
            throw new RecursoNaoEncontradoException("Paciente", 42);
        }

        @GetMapping("/teste/409")
        public void capacidadeExcedida() {
            throw new CapacidadeExcedidaException("302", 2);
        }

        @GetMapping("/teste/422")
        public void transicaoInvalida() {
            throw new TransicaoInvalidaException("A internação já foi encerrada");
        }

        @GetMapping("/teste/500")
        public void erroInterno() {
            throw new IllegalStateException("SELECT * FROM pacientes");
        }
    }

    static class DadosDeEntrada {

        @NotBlank(message = "obrigatório")
        private String nome;
    }
}
