package br.pucminas.vitalis.comum.service;

import org.springframework.http.HttpStatus;

public class TransicaoInvalidaException extends RegraDeNegocioException {

    public TransicaoInvalidaException(String mensagem) {
        super("TRANSICAO_INVALIDA", HttpStatus.UNPROCESSABLE_ENTITY, mensagem);
    }
}
