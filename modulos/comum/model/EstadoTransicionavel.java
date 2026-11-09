package br.pucminas.vitalis.comum.model;

public interface EstadoTransicionavel<E extends Enum<E>> {
    boolean permite(E destino);
}
