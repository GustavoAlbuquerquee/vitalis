package br.pucminas.vitalis.procedimentos.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import java.time.LocalDateTime;

public class ProcedimentoCirurgicoRequest {

    @NotNull
    @Positive
    private Long pacienteId;
    @NotNull
    @Positive
    private Long cirurgiaoId;
    @NotBlank
    private String descricao;
    @NotBlank
    private String tipoCirurgia;
    private String observacoesPreOperatorias;
    @NotNull
    private LocalDateTime dataHoraPrevista;

    public Long getPacienteId() {
        return pacienteId;
    }

    public void setPacienteId(Long pacienteId) {
        this.pacienteId = pacienteId;
    }

    public Long getCirurgiaoId() {
        return cirurgiaoId;
    }

    public void setCirurgiaoId(Long cirurgiaoId) {
        this.cirurgiaoId = cirurgiaoId;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getTipoCirurgia() {
        return tipoCirurgia;
    }

    public void setTipoCirurgia(String tipoCirurgia) {
        this.tipoCirurgia = tipoCirurgia;
    }

    public String getObservacoesPreOperatorias() {
        return observacoesPreOperatorias;
    }

    public void setObservacoesPreOperatorias(String observacoesPreOperatorias) {
        this.observacoesPreOperatorias = observacoesPreOperatorias;
    }

    public LocalDateTime getDataHoraPrevista() {
        return dataHoraPrevista;
    }

    public void setDataHoraPrevista(LocalDateTime dataHoraPrevista) {
        this.dataHoraPrevista = dataHoraPrevista;
    }
}
