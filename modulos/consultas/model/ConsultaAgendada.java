package br.pucminas.vitalis.consultas.model;

import br.pucminas.vitalis.comum.model.Campos;
import br.pucminas.vitalis.comum.service.AgendaService;
import br.pucminas.vitalis.consultas.service.CondicaoAtendimentoException;
import br.pucminas.vitalis.pacientes.model.Paciente;
import br.pucminas.vitalis.profissionais.model.ProfissionalSaude;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public abstract class ConsultaAgendada extends Consulta {
    private final LocalDateTime inicio;
    private final int duracaoMinutos;
    private final AgendaService agenda;

    protected ConsultaAgendada(Long id, Paciente paciente, ProfissionalSaude profissional,
                               LocalDateTime inicio, int duracaoMinutos, String motivo,
                               LocalDateTime criadoEm, AgendaService agenda) {
        super(id, paciente, profissional, motivo, criadoEm);
        Campos.exigir(inicio != null, "Data e horário são obrigatórios");
        Campos.exigir(duracaoMinutos > 0 && duracaoMinutos <= 1440,
                "Duração deve estar entre 1 e 1440 minutos");
        Campos.exigir(agenda != null, "Agenda é obrigatória");
        this.inicio = inicio;
        this.duracaoMinutos = duracaoMinutos;
        this.agenda = agenda;
    }

    protected final void validarAgenda() {
        validarParticipantes();
        if (!getProfissional().estaDisponivelEm(getInicio(), getFim())) {
            throw new CondicaoAtendimentoException("FORA_DA_DISPONIBILIDADE",
                    "O intervalo está fora da disponibilidade do profissional");
        }
        agenda.validarAusenciaDeConflito(this);
    }

    @Override public LocalDateTime getInicio() { return inicio; }
    @Override public LocalDateTime getFim() { return inicio.plusMinutes(duracaoMinutos); }
    public LocalDate getData() { return inicio.toLocalDate(); }
    public LocalTime getHorario() { return inicio.toLocalTime(); }
    public int getDuracaoMinutos() { return duracaoMinutos; }
}
