package br.pucminas.vitalis.internacoes.dto;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;

public class TransferenciaRequest {

    @NotNull
    @Positive
    private Long quartoId;

    public Long getQuartoId() {
        return quartoId;
    }

    public void setQuartoId(Long quartoId) {
        this.quartoId = quartoId;
    }
}
