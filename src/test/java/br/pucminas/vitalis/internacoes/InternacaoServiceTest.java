package br.pucminas.vitalis.internacoes;

import br.pucminas.vitalis.comum.service.CapacidadeExcedidaException;
import br.pucminas.vitalis.comum.service.AltaInvalidaException;
import br.pucminas.vitalis.comum.service.PacienteJaInternadoException;
import br.pucminas.vitalis.comum.service.QuartoIndisponivelException;
import br.pucminas.vitalis.internacoes.dto.InternacaoRequest;
import br.pucminas.vitalis.internacoes.model.Internacao;
import br.pucminas.vitalis.internacoes.model.StatusInternacao;
import br.pucminas.vitalis.internacoes.service.InternacaoService;
import br.pucminas.vitalis.pacientes.model.Paciente;
import br.pucminas.vitalis.pacientes.service.PacienteAtendimentoService;
import br.pucminas.vitalis.profissionais.model.ClinicoGeral;
import br.pucminas.vitalis.profissionais.service.ProfissionalService;
import br.pucminas.vitalis.quartos.dto.QuartoRequest;
import br.pucminas.vitalis.quartos.model.Quarto;
import br.pucminas.vitalis.quartos.model.SituacaoQuarto;
import br.pucminas.vitalis.quartos.model.TipoQuarto;
import br.pucminas.vitalis.quartos.service.QuartoService;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class InternacaoServiceTest {

    @Test
    void deveRespeitarCapacidadeLiberarLeitoEManterHistorico() {
        QuartoService quartos = new QuartoService();
        Quarto quarto = quartos.cadastrar(quarto("201", 2));
        InternacaoService service = service(quartos);

        Internacao primeira = service.internar(internacao(1L, quarto.getId()));
        service.internar(internacao(2L, quarto.getId()));
        assertEquals(SituacaoQuarto.OCUPADO, quarto.getSituacao());
        assertThrows(CapacidadeExcedidaException.class,
                () -> service.internar(internacao(3L, quarto.getId())));
        assertEquals(2, quarto.getOcupacaoAtual());
        assertEquals(2, service.listar(StatusInternacao.ATIVA, quarto.getId(), null).size());

        service.registrarAlta(primeira.getId(), LocalDateTime.now().plusHours(1));
        assertEquals(SituacaoQuarto.DISPONIVEL, quarto.getSituacao());
        assertEquals(StatusInternacao.ALTA_CONCEDIDA, service.buscar(primeira.getId()).getStatus());
        service.internar(internacao(3L, quarto.getId()));
        assertEquals(2, quarto.getOcupacaoAtual());
    }

    @Test
    void naoDevePermitirPacienteEmDuasInternacoesAtivas() {
        QuartoService quartos = new QuartoService();
        Quarto primeiro = quartos.cadastrar(quarto("101", 2));
        Quarto segundo = quartos.cadastrar(quarto("102", 2));
        InternacaoService service = service(quartos);
        service.internar(internacao(7L, primeiro.getId()));

        assertThrows(PacienteJaInternadoException.class,
                () -> service.internar(internacao(7L, segundo.getId())));
        assertEquals(0, segundo.getOcupacaoAtual());
    }

    @Test
    void quartoBloqueadoNaoRecebeInternacao() {
        QuartoService quartos = new QuartoService();
        Quarto quarto = quartos.cadastrar(quarto("301", 2));
        quartos.atualizarBloqueio(quarto.getId(), SituacaoQuarto.MANUTENCAO);
        InternacaoService service = service(quartos);

        assertThrows(QuartoIndisponivelException.class,
                () -> service.internar(internacao(9L, quarto.getId())));
        assertEquals(0, quarto.getOcupacaoAtual());
        assertEquals(0, service.listar(null, null, null).size());
    }

    @Test
    void transferenciaPreservaInternacaoAnteriorEMoveOcupacao() {
        QuartoService quartos = new QuartoService();
        Quarto origem = quartos.cadastrar(quarto("401", 2));
        Quarto destino = quartos.cadastrar(quarto("402", 2));
        InternacaoService service = service(quartos);
        Internacao anterior = service.internar(internacao(12L, origem.getId()));

        Internacao atual = service.transferir(anterior.getId(), destino.getId());

        assertEquals(StatusInternacao.TRANSFERIDA, anterior.getStatus());
        assertEquals(origem.getId(), anterior.getQuartoId());
        assertEquals(StatusInternacao.ATIVA, atual.getStatus());
        assertEquals(destino.getId(), atual.getQuartoId());
        assertEquals(0, origem.getOcupacaoAtual());
        assertEquals(1, destino.getOcupacaoAtual());
    }

    @Test
    void altaComDataAnteriorMantemInternacaoELeitoAtivos() {
        QuartoService quartos = new QuartoService();
        Quarto quarto = quartos.cadastrar(quarto("501", 1));
        InternacaoService service = service(quartos);
        Internacao ativa = service.internar(internacao(23L, quarto.getId()));

        assertThrows(AltaInvalidaException.class,
                () -> service.registrarAlta(ativa.getId(), ativa.getDataEntrada().minusMinutes(1)));
        assertEquals(StatusInternacao.ATIVA, ativa.getStatus());
        assertEquals(1, quarto.getOcupacaoAtual());
    }

    private QuartoRequest quarto(String numero, int capacidade) {
        QuartoRequest request = new QuartoRequest();
        request.setNumero(numero);
        request.setAndar(2);
        request.setCapacidadeMaxima(capacidade);
        request.setTipo(TipoQuarto.ENFERMARIA);
        return request;
    }

    private InternacaoRequest internacao(Long pacienteId, Long quartoId) {
        InternacaoRequest request = new InternacaoRequest();
        request.setPacienteId(pacienteId);
        request.setProfissionalId(1L);
        request.setQuartoId(quartoId);
        request.setDataEntrada(LocalDateTime.now());
        request.setDataPrevistaAlta(LocalDate.now().plusDays(2));
        request.setMotivo("Observação clínica");
        return request;
    }

    private InternacaoService service(QuartoService quartos) {
        PacienteAtendimentoService pacientes = id ->
                new Paciente(id, "Paciente de teste", "31999999999", "paciente@vitalis.med.br", "52998224725");
        ProfissionalService profissionais = id ->
                new ClinicoGeral(id, "Clínico de teste", "CRM-MG " + id,
                        "31999999998", "clinico@vitalis.med.br", true);
        return new InternacaoService(quartos, pacientes, profissionais);
    }
}
