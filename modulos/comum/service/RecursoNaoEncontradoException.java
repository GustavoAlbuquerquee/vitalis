package br.pucminas.vitalis.comum.service;

import org.springframework.http.HttpStatus;

public class RecursoNaoEncontradoException extends HospitalException {

    public RecursoNaoEncontradoException(String recurso, Object id) {
        super("RECURSO_NAO_ENCONTRADO", HttpStatus.NOT_FOUND,
                recurso + " com identificador " + id + " não foi encontrado");
    }
}
