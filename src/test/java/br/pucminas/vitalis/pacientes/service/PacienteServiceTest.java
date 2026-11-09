package br.pucminas.vitalis.pacientes.service;

import br.pucminas.vitalis.comum.model.UF;
import br.pucminas.vitalis.comum.service.RecursoNaoEncontradoException;
import br.pucminas.vitalis.comum.service.RegistroDuplicadoException;
import br.pucminas.vitalis.pacientes.dto.EnderecoDTO;
import br.pucminas.vitalis.pacientes.dto.PacienteRequest;
import br.pucminas.vitalis.pacientes.dto.PacienteResponse;
import br.pucminas.vitalis.pacientes.dto.PaginaResponse;
import br.pucminas.vitalis.pacientes.repository.PacienteRepositoryEmMemoria;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Regras de negócio de paciente, sem servidor e sem banco. */
class PacienteServiceTest {

    private PacienteService service;

    @BeforeEach
    void preparar() {
        service = new PacienteService(new PacienteRepositoryEmMemoria());
    }

    @Test
    @DisplayName("deve cadastrar paciente quando os dados sao validos")
    void deveCadastrarPacienteQuandoOsDadosSaoValidos() {
        PacienteResponse criado = service.criar(pedido("Maria Silva", "529.982.247-25"));

        assertEquals("Maria Silva", criado.getNome());
        assertEquals("529.982.247-25", criado.getCpf(), "o CPF volta formatado para exibicao");
        assertTrue(criado.isAtivo());
        assertTrue(criado.getId() > 0);
    }

    @Test
    @DisplayName("deve recusar cadastro quando o cpf ja existe")
    void deveRecusarCadastroQuandoOCpfJaExiste() {
        service.criar(pedido("Maria Silva", "529.982.247-25"));

        RegistroDuplicadoException erro = assertThrows(RegistroDuplicadoException.class,
                () -> service.criar(pedido("Maria Silva Souza", "529.982.247-25")));

        assertEquals("REGISTRO_DUPLICADO", erro.getCodigo());
        assertEquals("cpf", erro.getCampo());
    }

    @Test
    @DisplayName("deve tratar cpf com e sem mascara como o mesmo cpf")
    void deveTratarCpfComESemMascaraComoOMesmoCpf() {
        service.criar(pedido("Maria Silva", "529.982.247-25"));

        assertThrows(RegistroDuplicadoException.class,
                () -> service.criar(pedido("Outra Pessoa", "52998224725")));
    }

    @Test
    @DisplayName("deve permitir atualizar mantendo o proprio cpf")
    void devePermitirAtualizarMantendoOProprioCpf() {
        PacienteResponse criado = service.criar(pedido("Maria Silva", "529.982.247-25"));

        PacienteRequest alteracao = pedido("Maria Silva Souza", "529.982.247-25");
        PacienteResponse atualizado = service.atualizar(criado.getId(), alteracao);

        assertEquals("Maria Silva Souza", atualizado.getNome());
        assertEquals(criado.getId(), atualizado.getId());
    }

    @Test
    @DisplayName("deve recusar atualizacao quando o cpf pertence a outro paciente")
    void deveRecusarAtualizacaoQuandoOCpfPertenceAOutroPaciente() {
        service.criar(pedido("Maria Silva", "529.982.247-25"));
        PacienteResponse segundo = service.criar(pedido("Joao Souza", "168.995.350-09"));

        assertThrows(RegistroDuplicadoException.class,
                () -> service.atualizar(segundo.getId(), pedido("Joao Souza", "529.982.247-25")));
    }

    @Test
    @DisplayName("deve desativar sem apagar, preservando o historico")
    void deveDesativarSemApagarPreservandoOHistorico() {
        PacienteResponse criado = service.criar(pedido("Maria Silva", "529.982.247-25"));

        service.desativar(criado.getId());

        PacienteResponse depois = service.buscarPorId(criado.getId());
        assertFalse(depois.isAtivo(), "continua acessivel por id");
        assertEquals(0, service.listar(null, null, 0, 20).getTotalDeItens(),
                "mas sai da listagem");
    }

    @Test
    @DisplayName("deve liberar o cpf de paciente desativado apenas apos reativacao")
    void deveManterOCpfReservadoMesmoComPacienteDesativado() {
        PacienteResponse criado = service.criar(pedido("Maria Silva", "529.982.247-25"));
        service.desativar(criado.getId());

        assertThrows(RegistroDuplicadoException.class,
                () -> service.criar(pedido("Outra Pessoa", "529.982.247-25")),
                "desativar nao libera o CPF: o cadastro antigo continua existindo");
    }

    @Test
    @DisplayName("deve lancar nao encontrado quando o id nao existe")
    void deveLancarNaoEncontradoQuandoOIdNaoExiste() {
        assertThrows(RecursoNaoEncontradoException.class, () -> service.buscarPorId(999L));
    }

    @Test
    @DisplayName("deve calcular a idade em anos completos")
    void deveCalcularAIdadeEmAnosCompletos() {
        PacienteRequest pedido = pedido("Maria Silva", "529.982.247-25");
        pedido.setDataNascimento(LocalDate.now().minusYears(30).minusDays(1));

        assertEquals(30, service.criar(pedido).getIdade());
    }

    @Test
    @DisplayName("deve encontrar por nome ignorando acento e caixa")
    void deveEncontrarPorNomeIgnorandoAcentoECaixa() {
        service.criar(pedido("José Antônio", "529.982.247-25"));

        assertEquals(1, service.listar("jose", null, 0, 20).getTotalDeItens());
        assertEquals(1, service.listar("ANTONIO", null, 0, 20).getTotalDeItens());
    }

    @Test
    @DisplayName("deve paginar a listagem")
    void devePaginarAListagem() {
        service.criar(pedido("Ana Lima", "529.982.247-25"));
        service.criar(pedido("Bruno Dias", "168.995.350-09"));
        service.criar(pedido("Carla Nunes", "398.147.230-00"));

        PaginaResponse<PacienteResponse> primeira = service.listar(null, null, 0, 2);

        assertEquals(2, primeira.getConteudo().size());
        assertEquals(3, primeira.getTotalDeItens());
        assertEquals(2, primeira.getTotalDePaginas());
        assertEquals("Ana Lima", primeira.getConteudo().get(0).getNome(),
                "ordenado por nome");
    }

    private static PacienteRequest pedido(String nome, String cpf) {
        EnderecoDTO endereco = new EnderecoDTO();
        endereco.setLogradouro("Rua das Acácias");
        endereco.setNumero("120");
        endereco.setBairro("Vila Nova");
        endereco.setCidade("Belo Horizonte");
        endereco.setUf(UF.MG);
        endereco.setCep("30110-000");

        PacienteRequest pedido = new PacienteRequest();
        pedido.setNome(nome);
        pedido.setCpf(cpf);
        pedido.setDataNascimento(LocalDate.of(1994, 3, 14));
        pedido.setTelefone("31 99999-0000");
        pedido.setEmail("paciente@exemplo.com");
        pedido.setEndereco(endereco);
        return pedido;
    }
}
