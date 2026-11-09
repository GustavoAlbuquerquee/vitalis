package br.pucminas.vitalis.consultas.model;

import br.pucminas.vitalis.comum.model.Transicoes;
import br.pucminas.vitalis.comum.service.*;
import br.pucminas.vitalis.pacientes.model.Paciente;
import br.pucminas.vitalis.profissionais.model.ClinicoGeral;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.Arguments;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Stream;
import static org.junit.jupiter.api.Assertions.*;

class StatusConsultaTest {
    static Stream<Arguments> transicoes() {
        Set<String> permitidas = new HashSet<>(Arrays.asList("AGENDADA:CONFIRMADA",
                "AGENDADA:CANCELADA", "AGENDADA:NAO_COMPARECEU", "CONFIRMADA:EM_ATENDIMENTO",
                "CONFIRMADA:CANCELADA", "CONFIRMADA:NAO_COMPARECEU",
                "EM_ATENDIMENTO:CONCLUIDA", "EM_ATENDIMENTO:CANCELADA"));
        return Arrays.stream(StatusConsulta.values()).flatMap(de ->
                Arrays.stream(StatusConsulta.values()).map(para ->
                        Arguments.of(de, para, permitidas.contains(de + ":" + para))));
    }

    @ParameterizedTest @MethodSource("transicoes")
    void cobreTodasAs36Combinacoes(StatusConsulta de, StatusConsulta para, boolean permitida) {
        if (permitida) assertEquals(para, Transicoes.validar(de, para));
        else assertThrows(TransicaoInvalidaException.class, () -> Transicoes.validar(de, para));
    }

    private ConsultaRotina consulta() {
        return new ConsultaRotina(1L, new Paciente(1L, "Ana", null, null, "123"),
                new ClinicoGeral(2L, "Bia", null, null, "CRM-1", Collections.emptyList()),
                LocalDateTime.of(2030, 1, 7, 10, 0), 30, "Retorno", LocalDateTime.now(),
                new AgendaService(Collections.emptyList()));
    }

    @Test void modeloPreservaEstadoEObservacoesAoRecusarOperacao() {
        Consulta consulta = consulta();
        assertThrows(TransicaoInvalidaException.class, consulta::iniciar);
        assertThrows(TransicaoInvalidaException.class, () -> consulta.concluir("indevida"));
        assertThrows(TransicaoInvalidaException.class, () -> consulta.registrarObservacoes("cedo"));
        assertEquals(StatusConsulta.AGENDADA, consulta.getStatus());
        assertNull(consulta.getObservacoes());
        consulta.confirmar();
        consulta.iniciar();
        consulta.concluir("Realizada");
        consulta.registrarObservacoes("Complemento");
        assertEquals("Complemento", consulta.getObservacoes());
        assertThrows(TransicaoInvalidaException.class, consulta::confirmar);
        assertThrows(TransicaoInvalidaException.class, consulta::cancelar);
        assertEquals(StatusConsulta.CONCLUIDA, consulta.getStatus());
    }

    @Test void cancelamentoEFaltaLiberamAgendaSemPermitirReabertura() {
        Consulta cancelada = consulta();
        cancelada.cancelar();
        assertFalse(cancelada.ocupaAgenda());
        assertThrows(TransicaoInvalidaException.class, () -> cancelada.concluir("inválida"));
        Consulta falta = consulta();
        falta.registrarNaoComparecimento();
        assertFalse(falta.ocupaAgenda());
        assertThrows(TransicaoInvalidaException.class, falta::confirmar);
    }
}
