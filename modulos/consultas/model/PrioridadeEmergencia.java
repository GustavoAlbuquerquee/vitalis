package br.pucminas.vitalis.consultas.model;

public enum PrioridadeEmergencia {
    BAIXA(1), MODERADA(2), ALTA(3), CRITICA(4);

    private final int peso;
    PrioridadeEmergencia(int peso) { this.peso = peso; }
    public int getPeso() { return peso; }
}
