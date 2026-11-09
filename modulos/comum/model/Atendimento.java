package br.pucminas.vitalis.comum.model;

import java.time.LocalDateTime;
import java.util.Objects;

public abstract class Atendimento {

    private final Long pacienteId;
    private final Long profissionalId;
    private String observacoes;

    protected Atendimento(Long pacienteId, Long profissionalId, String observacoes) {
        this.pacienteId = pacienteId;
        this.profissionalId = profissionalId;
        this.observacoes = observacoes;
    }

    public Long getPacienteId() {
        return pacienteId;
    }

    public Long getProfissionalId() {
        return profissionalId;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public abstract LocalDateTime getInicio();

    public abstract LocalDateTime getFim();

    public abstract void validarCondicoes();

    public abstract boolean estaAtivo();

    public boolean conflitaCom(Atendimento outro) {
        Objects.requireNonNull(outro, "O atendimento comparado é obrigatório");
        return estaAtivo() && outro.estaAtivo()
                && Objects.equals(profissionalId, outro.profissionalId)
                && getInicio().isBefore(outro.getFim())
                && outro.getInicio().isBefore(getFim());
    }
}
