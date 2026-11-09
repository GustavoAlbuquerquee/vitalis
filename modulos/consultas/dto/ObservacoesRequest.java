package br.pucminas.vitalis.consultas.dto;

import javax.validation.constraints.Size;

public class ObservacoesRequest {
    @Size(max = 10000) public String observacoes;
}
