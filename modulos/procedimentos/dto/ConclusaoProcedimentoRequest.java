package br.pucminas.vitalis.procedimentos.dto;

import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class ConclusaoProcedimentoRequest {

    @NotNull
    private LocalDateTime dataHoraConclusao;
    private String observacoesPosOperatorias;

    public LocalDateTime getDataHoraConclusao() {
        return dataHoraConclusao;
    }

    public void setDataHoraConclusao(LocalDateTime dataHoraConclusao) {
        this.dataHoraConclusao = dataHoraConclusao;
    }

    public String getObservacoesPosOperatorias() {
        return observacoesPosOperatorias;
    }

    public void setObservacoesPosOperatorias(String observacoesPosOperatorias) {
        this.observacoesPosOperatorias = observacoesPosOperatorias;
    }
}
