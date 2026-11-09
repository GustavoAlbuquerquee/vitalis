package br.pucminas.vitalis.comum.model;

import br.pucminas.vitalis.comum.service.TransicaoInvalidaException;

public final class Transicoes {
    private Transicoes() { }

    public static <E extends Enum<E> & EstadoTransicionavel<E>> E validar(E atual, E destino) {
        if (atual == null || destino == null || !atual.permite(destino)) {
            throw new TransicaoInvalidaException("Transição de " + atual + " para " + destino + " não permitida");
        }
        return destino;
    }
}
