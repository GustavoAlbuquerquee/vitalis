package br.pucminas.vitalis.comum.service;

public class CapacidadeExcedidaException extends RegraDeNegocioException {

    private final String numeroQuarto;
    private final int capacidadeMaxima;

    public CapacidadeExcedidaException(String numeroQuarto, int capacidadeMaxima) {
        super("CAPACIDADE_EXCEDIDA",
                "O quarto " + numeroQuarto + " já atingiu a capacidade máxima de "
                        + capacidadeMaxima + " pacientes");
        this.numeroQuarto = numeroQuarto;
        this.capacidadeMaxima = capacidadeMaxima;
    }

    public String getNumeroQuarto() {
        return numeroQuarto;
    }

    public int getCapacidadeMaxima() {
        return capacidadeMaxima;
    }
}
