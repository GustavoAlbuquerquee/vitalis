package br.pucminas.vitalis.procedimentos.dto;

import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class InicioProcedimentoRequest {

    @NotNull
    private LocalDateTime dataHoraEfetiva;

    public LocalDateTime getDataHoraEfetiva() {
        return dataHoraEfetiva;
    }

    public void setDataHoraEfetiva(LocalDateTime dataHoraEfetiva) {
        this.dataHoraEfetiva = dataHoraEfetiva;
    }
}
