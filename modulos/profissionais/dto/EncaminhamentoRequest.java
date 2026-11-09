package br.pucminas.vitalis.profissionais.dto;

import br.pucminas.vitalis.profissionais.model.Especialidade;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;

public class EncaminhamentoRequest {

    @NotNull
    @Positive
    private Long pacienteId;
    @NotNull
    private Especialidade especialidade;
    @NotBlank
    private String motivo;

    public Long getPacienteId() {
        return pacienteId;
    }

    public void setPacienteId(Long pacienteId) {
        this.pacienteId = pacienteId;
    }

    public Especialidade getEspecialidade() {
        return especialidade;
    }

    public void setEspecialidade(Especialidade especialidade) {
        this.especialidade = especialidade;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }
}
