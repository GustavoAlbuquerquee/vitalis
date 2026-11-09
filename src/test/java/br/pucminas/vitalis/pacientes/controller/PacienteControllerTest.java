package br.pucminas.vitalis.pacientes.controller;

import br.pucminas.vitalis.comum.controller.GlobalExceptionHandler;
import br.pucminas.vitalis.pacientes.repository.PacienteRepositoryEmMemoria;
import br.pucminas.vitalis.pacientes.service.PacienteService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Contrato HTTP de /api/v1/pacientes.
 *
 * <p>Sobe o controller com o {@code GlobalExceptionHandler} de verdade — é
 * ele quem transforma a exceção de regra de negócio na resposta de erro, e
 * é isso que o teste precisa provar.
 */
class PacienteControllerTest {

    private MockMvc mockMvc;

    private static final String PACIENTE_VALIDO = "{"
            + "\"nome\":\"Maria Silva\","
            + "\"cpf\":\"529.982.247-25\","
            + "\"dataNascimento\":\"1994-03-14\","
            + "\"telefone\":\"31 99999-0000\","
            + "\"email\":\"maria@exemplo.com\","
            + "\"endereco\":{"
            + "\"logradouro\":\"Rua das Acácias\",\"numero\":\"120\","
            + "\"bairro\":\"Vila Nova\",\"cidade\":\"Belo Horizonte\","
            + "\"uf\":\"MG\",\"cep\":\"30110-000\"}"
            + "}";

    @BeforeEach
    void preparar() {
        PacienteService service = new PacienteService(new PacienteRepositoryEmMemoria());
        ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());
        mockMvc = MockMvcBuilders.standaloneSetup(new PacienteController(service))
                .setControllerAdvice(new GlobalExceptionHandler())
                .setMessageConverters(new MappingJackson2HttpMessageConverter(mapper))
                .build();
    }

    @Test
    @DisplayName("POST deve devolver 201 com Location apontando para o recurso")
    void postDeveDevolver201ComLocation() throws Exception {
        mockMvc.perform(post("/pacientes")
                        .contentType(MediaType.APPLICATION_JSON).content(PACIENTE_VALIDO))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", containsString("/pacientes/1")))
                .andExpect(jsonPath("$.nome").value("Maria Silva"))
                .andExpect(jsonPath("$.cpf").value("529.982.247-25"))
                .andExpect(jsonPath("$.ativo").value(true));
    }

    @Test
    @DisplayName("POST deve devolver 409 quando o cpf ja existe")
    void postDeveDevolver409QuandoOCpfJaExiste() throws Exception {
        mockMvc.perform(post("/pacientes")
                .contentType(MediaType.APPLICATION_JSON).content(PACIENTE_VALIDO));

        mockMvc.perform(post("/pacientes")
                        .contentType(MediaType.APPLICATION_JSON).content(PACIENTE_VALIDO))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("REGISTRO_DUPLICADO"));
    }

    @Test
    @DisplayName("POST deve devolver 400 quando falta campo obrigatorio")
    void postDeveDevolver400QuandoFaltaCampoObrigatorio() throws Exception {
        mockMvc.perform(post("/pacientes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"cpf\":\"529.982.247-25\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("DADOS_INVALIDOS"));
    }

    @Test
    @DisplayName("POST deve devolver 400 quando a data de nascimento e futura")
    void postDeveDevolver400QuandoADataDeNascimentoEFutura() throws Exception {
        String futuro = PACIENTE_VALIDO.replace("1994-03-14", "2099-01-01");

        mockMvc.perform(post("/pacientes")
                        .contentType(MediaType.APPLICATION_JSON).content(futuro))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("DADOS_INVALIDOS"));
    }

    @Test
    @DisplayName("GET por id deve devolver 404 quando nao existe")
    void getPorIdDeveDevolver404QuandoNaoExiste() throws Exception {
        mockMvc.perform(get("/pacientes/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("RECURSO_NAO_ENCONTRADO"));
    }

    @Test
    @DisplayName("GET da listagem deve devolver pagina com total")
    void getDaListagemDeveDevolverPaginaComTotal() throws Exception {
        mockMvc.perform(post("/pacientes")
                .contentType(MediaType.APPLICATION_JSON).content(PACIENTE_VALIDO));

        mockMvc.perform(get("/pacientes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalDeItens").value(1))
                .andExpect(jsonPath("$.conteudo[0].nome").value("Maria Silva"));
    }

    @Test
    @DisplayName("DELETE deve devolver 204 e tirar da listagem sem apagar")
    void deleteDeveDevolver204ETirarDaListagemSemApagar() throws Exception {
        mockMvc.perform(post("/pacientes")
                .contentType(MediaType.APPLICATION_JSON).content(PACIENTE_VALIDO));

        mockMvc.perform(delete("/pacientes/1"))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/pacientes"))
                .andExpect(jsonPath("$.totalDeItens").value(0));

        mockMvc.perform(get("/pacientes/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ativo").value(false));
    }
}
