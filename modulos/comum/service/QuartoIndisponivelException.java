package br.pucminas.vitalis.comum.service;

public class QuartoIndisponivelException extends RegraDeNegocioException {

    private final String numeroQuarto;

    public QuartoIndisponivelException(String numeroQuarto) {
        super("QUARTO_INDISPONIVEL",
                "O quarto " + numeroQuarto + " não está disponível para internação");
        this.numeroQuarto = numeroQuarto;
    }

    public String getNumeroQuarto() {
        return numeroQuarto;
    }
}
