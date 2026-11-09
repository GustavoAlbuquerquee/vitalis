package br.pucminas.vitalis.consultas.service;

import br.pucminas.vitalis.comum.service.*;
import br.pucminas.vitalis.consultas.dto.*;
import br.pucminas.vitalis.consultas.model.*;
import br.pucminas.vitalis.consultas.repository.ConsultaRepositoryMemoria;
import br.pucminas.vitalis.pacientes.model.Paciente;
import br.pucminas.vitalis.profissionais.model.ClinicoGeral;
import org.junit.jupiter.api.Test;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;
import static org.junit.jupiter.api.Assertions.*;

class FilaEmergenciaTest {
    private final ConsultaRepositoryMemoria repository = new ConsultaRepositoryMemoria();
    private final AgendaService agenda = new AgendaService(Collections.singletonList(repository));
    private final Paciente paciente = new Paciente(1L, "Ana", null, null, "123");
    private final ClinicoGeral profissional = new ClinicoGeral(1L, "Bia", null, null, "CRM", Collections.emptyList());

    private ConsultaService service(int hora) {
        return new ConsultaService(repository, id -> paciente, id -> profissional, agenda,
                Clock.fixed(Instant.parse(String.format("2030-01-01T%02d:00:00Z", hora + 3)),
                        ZoneId.of("America/Sao_Paulo")));
    }

    private long criar(int hora, PrioridadeEmergencia prioridade) {
        CriarConsultaRequest dados = new CriarConsultaRequest();
        dados.modalidade = ModalidadeConsulta.EMERGENCIA;
        dados.pacienteId = 1L;
        dados.profissionalId = 1L;
        dados.motivo = "Urgência";
        dados.prioridade = prioridade;
        return service(hora).criar(dados).id;
    }

    @Test void prioridadePrecedeChegadaEDesempataPorId() {
        long baixa = criar(8, PrioridadeEmergencia.BAIXA);
        long moderada = criar(9, PrioridadeEmergencia.MODERADA);
        long criticaTardia = criar(15, PrioridadeEmergencia.CRITICA);
        long alta = criar(10, PrioridadeEmergencia.ALTA);
        long criticaAntiga = criar(14, PrioridadeEmergencia.CRITICA);
        long criticaEmpatada = criar(14, PrioridadeEmergencia.CRITICA);
        List<Long> fila = service(16).listar(null, null, null,
                SituacaoConsulta.AGUARDANDO, ModalidadeConsulta.EMERGENCIA).stream()
                .map(c -> c.id).collect(Collectors.toList());
        assertEquals(Arrays.asList(criticaAntiga, criticaEmpatada, criticaTardia, alta, moderada, baixa), fila);
    }

    @Test void separaGruposRegistraMomentosEPreservaCancelamento() {
        long aguardando = criar(8, PrioridadeEmergencia.MODERADA);
        long iniciado = criar(9, PrioridadeEmergencia.ALTA);
        long concluido = criar(10, PrioridadeEmergencia.CRITICA);
        long cancelado = criar(11, PrioridadeEmergencia.BAIXA);
        service(12).iniciar(iniciado);
        service(12).iniciar(concluido);
        service(13).concluir(concluido, "Avaliado");
        service(13).cancelar(cancelado);
        assertEquals(aguardando, grupo(SituacaoConsulta.AGUARDANDO).get(0).id);
        assertEquals(iniciado, grupo(SituacaoConsulta.EM_ATENDIMENTO).get(0).id);
        assertEquals(concluido, grupo(SituacaoConsulta.CONCLUIDA).get(0).id);
        assertEquals(1, grupo(SituacaoConsulta.AGUARDANDO).size());
        ConsultaResponse resposta = service(14).buscar(concluido);
        assertEquals(LocalDateTime.of(2030, 1, 1, 12, 0), resposta.iniciadoEm);
        assertEquals(LocalDateTime.of(2030, 1, 1, 13, 0), resposta.concluidoEm);
        assertEquals(SituacaoConsulta.CANCELADA, service(14).buscar(cancelado).status);
        assertThrows(TransicaoInvalidaException.class, () -> service(14).iniciar(concluido));
        assertThrows(TransicaoInvalidaException.class, () -> service(14).registrarFalta(aguardando));
        assertThrows(TransicaoInvalidaException.class, () -> service(14).concluir(aguardando, "inválido"));
    }

    private List<ConsultaResponse> grupo(SituacaoConsulta situacao) {
        return service(14).listar(null, null, LocalDate.of(2030, 1, 1), situacao, ModalidadeConsulta.EMERGENCIA);
    }

    @Test void rejeitaPrioridadeAusenteETemposInvertidosSemAlterarEstado() {
        assertThrows(DadosInvalidosException.class, () -> criar(8, null));
        long id = criar(10, PrioridadeEmergencia.ALTA);
        assertThrows(DadosInvalidosException.class, () -> service(9).iniciar(id));
        assertEquals(SituacaoConsulta.AGUARDANDO, service(12).buscar(id).status);
        service(12).iniciar(id);
        assertThrows(DadosInvalidosException.class, () -> service(11).concluir(id, "inválido"));
        assertEquals(SituacaoConsulta.EM_ATENDIMENTO, service(12).buscar(id).status);
        assertNull(service(12).buscar(id).observacoes);
    }
}
