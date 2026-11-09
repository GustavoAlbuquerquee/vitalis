package br.pucminas.vitalis.consultas.model;

import br.pucminas.vitalis.comum.model.Atendimento;
import br.pucminas.vitalis.comum.service.*;
import br.pucminas.vitalis.consultas.service.CondicaoAtendimentoException;
import br.pucminas.vitalis.pacientes.model.Paciente;
import br.pucminas.vitalis.profissionais.model.*;
import org.junit.jupiter.api.Test;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

class ModalidadesTest {
    private final LocalDateTime inicio = LocalDateTime.of(2030, 1, 7, 10, 0);
    private final Paciente paciente = new Paciente(1L, "Ana", null, null, "12345678901");
    private final ProfissionalSaude medico = new Especialista(2L, "Bia", null, null, "CRM-1",
            Especialidade.CARDIOLOGIA, Collections.singletonList(new Disponibilidade(
                    DayOfWeek.MONDAY, LocalTime.of(8, 0), LocalTime.of(18, 0))));
    private final List<Atendimento<?, ?>> ocupados = new ArrayList<>();
    private final AgendaService agenda = new AgendaService(Collections.singletonList(id -> ocupados));

    private ConsultaRotina rotina(LocalDateTime hora) {
        return new ConsultaRotina(1L, paciente, medico, hora, 30, "Avaliação", inicio, agenda);
    }

    @Test void rotinaAceitaJanelaERecusaForaDela() {
        assertDoesNotThrow(() -> rotina(inicio).validarCondicoes());
        assertThrows(CondicaoAtendimentoException.class,
                () -> rotina(inicio.withHour(17).withMinute(45)).validarCondicoes());
    }

    @Test void especializadaValidaAgendaEArea() {
        ConsultaEspecializada consulta = new ConsultaEspecializada(2L, paciente, medico,
                inicio, 30, "Revisão", inicio, agenda, Especialidade.CARDIOLOGIA);
        assertDoesNotThrow(consulta::validarCondicoes);
        assertThrows(CondicaoAtendimentoException.class, () -> new ConsultaEspecializada(
                2L, paciente, medico, inicio, 30, "Revisão", inicio, agenda,
                Especialidade.NEUROLOGIA).validarCondicoes());
        ocupados.add(rotina(inicio));
        assertThrows(ConflitoDeHorarioException.class, consulta::validarCondicoes);
    }

    @Test void conflitoCruzaModalidadesEPermiteIntervalosAdjacentes() {
        Atendimento<Paciente, ProfissionalSaude> cirurgia = new Atendimento<Paciente, ProfissionalSaude>(
                1L, paciente, medico, inicio) {
            public LocalDateTime getInicio() { return inicio; }
            public LocalDateTime getFim() { return inicio.plusHours(1); }
            public void validarCondicoes() { }
        };
        ocupados.add(cirurgia);
        assertThrows(ConflitoDeHorarioException.class, () -> rotina(inicio).validarCondicoes());
        assertDoesNotThrow(() -> rotina(inicio.plusHours(1)).validarCondicoes());
    }

    @Test void emergenciaDispensaAgendaMasExigeParticipantesAtivos() {
        ocupados.add(rotina(inicio));
        AtendimentoEmergencia emergencia = new AtendimentoEmergencia(3L, paciente, medico,
                "Urgência", inicio.withHour(23));
        assertDoesNotThrow(emergencia::validarCondicoes);
        paciente.desativar();
        assertThrows(CondicaoAtendimentoException.class, emergencia::validarCondicoes);
    }
}
