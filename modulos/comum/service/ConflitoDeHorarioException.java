package br.pucminas.vitalis.comum.service;

import java.time.LocalDateTime;

public class ConflitoDeHorarioException extends RegraDeNegocioException {

    private final Long profissionalId;
    private final LocalDateTime horario;

    public ConflitoDeHorarioException(Long profissionalId, LocalDateTime horario) {
        super("CONFLITO_DE_HORARIO",
                "O profissional já possui atendimento marcado neste horário");
        this.profissionalId = profissionalId;
        this.horario = horario;
    }

    public Long getProfissionalId() {
        return profissionalId;
    }

    public LocalDateTime getHorario() {
        return horario;
    }
}
