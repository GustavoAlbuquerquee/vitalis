package br.pucminas.vitalis.quartos.dto;

import br.pucminas.vitalis.quartos.model.SituacaoQuarto;

import javax.validation.constraints.NotNull;

public class BloqueioQuartoRequest {

    @NotNull
    private SituacaoQuarto situacao;

    public SituacaoQuarto getSituacao() {
        return situacao;
    }

    public void setSituacao(SituacaoQuarto situacao) {
        this.situacao = situacao;
    }
}
