package br.pucminas.vitalis.comum.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class ErroResponse {

    private final LocalDateTime timestamp;
    private final int status;
    private final String codigo;
    private final String mensagem;
    private final String caminho;
    private final List<String> detalhes;

    public ErroResponse(LocalDateTime timestamp, int status, String codigo, String mensagem,
                        String caminho, List<String> detalhes) {
        this.timestamp = timestamp;
        this.status = status;
        this.codigo = codigo;
        this.mensagem = mensagem;
        this.caminho = caminho;
        this.detalhes = Collections.unmodifiableList(
                new ArrayList<>(detalhes == null ? Collections.<String>emptyList() : detalhes));
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public int getStatus() {
        return status;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getMensagem() {
        return mensagem;
    }

    public String getCaminho() {
        return caminho;
    }

    public List<String> getDetalhes() {
        return detalhes;
    }
}
