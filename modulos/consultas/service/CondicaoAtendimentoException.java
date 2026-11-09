package br.pucminas.vitalis.consultas.service;

import br.pucminas.vitalis.comum.service.RegraDeNegocioException;

public class CondicaoAtendimentoException extends RegraDeNegocioException {
    public CondicaoAtendimentoException(String codigo, String mensagem) { super(codigo, mensagem); }
}
