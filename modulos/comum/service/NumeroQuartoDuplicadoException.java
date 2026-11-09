package br.pucminas.vitalis.comum.service;

public class NumeroQuartoDuplicadoException extends RegraDeNegocioException {

    public NumeroQuartoDuplicadoException(String numero) {
        super("NUMERO_QUARTO_DUPLICADO", "O número do quarto " + numero + " já está cadastrado");
    }
}
