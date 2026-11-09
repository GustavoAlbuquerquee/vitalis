package br.pucminas.vitalis.internacoes.dto;

import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class AltaRequest {

    @NotNull
    private LocalDateTime dataEfetivaAlta;

    public LocalDateTime getDataEfetivaAlta() {
        return dataEfetivaAlta;
    }

    public void setDataEfetivaAlta(LocalDateTime dataEfetivaAlta) {
        this.dataEfetivaAlta = dataEfetivaAlta;
    }
}
