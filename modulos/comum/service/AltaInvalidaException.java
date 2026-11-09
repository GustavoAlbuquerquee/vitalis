package br.pucminas.vitalis.comum.service;

import org.springframework.http.HttpStatus;

public class AltaInvalidaException extends RegraDeNegocioException {

    public AltaInvalidaException(String mensagem) {
        super("ALTA_INVALIDA", HttpStatus.UNPROCESSABLE_ENTITY, mensagem);
    }
}
