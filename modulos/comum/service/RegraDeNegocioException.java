package br.pucminas.vitalis.comum.service;

import org.springframework.http.HttpStatus;

import java.util.List;

public abstract class RegraDeNegocioException extends HospitalException {

    protected RegraDeNegocioException(String codigo, String mensagem) {
        this(codigo, HttpStatus.CONFLICT, mensagem);
    }

    protected RegraDeNegocioException(String codigo, HttpStatus status, String mensagem) {
        super(codigo, status, mensagem);
    }

    protected RegraDeNegocioException(String codigo, HttpStatus status, String mensagem,
                                      List<String> detalhes) {
        super(codigo, status, mensagem, detalhes);
    }
}
