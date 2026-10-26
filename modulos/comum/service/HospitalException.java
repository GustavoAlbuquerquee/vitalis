package br.pucminas.vitalis.comum.service;

import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public abstract class HospitalException extends RuntimeException {

    private final String codigo;
    private final HttpStatus status;
    private final List<String> detalhes;

    protected HospitalException(String codigo, HttpStatus status, String mensagem) {
        this(codigo, status, mensagem, Collections.<String>emptyList());
    }

    protected HospitalException(String codigo, HttpStatus status, String mensagem, List<String> detalhes) {
        super(mensagem);
        this.codigo = codigo;
        this.status = status;
        this.detalhes = Collections.unmodifiableList(
                new ArrayList<>(detalhes == null ? Collections.<String>emptyList() : detalhes));
    }

    public String getCodigo() {
        return codigo;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public List<String> getDetalhes() {
        return detalhes;
    }
}
