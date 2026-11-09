package br.pucminas.vitalis.comum.service;

public class ConflitoDisponibilidadeException extends RegraDeNegocioException {

    public ConflitoDisponibilidadeException() {
        super("CONFLITO_DE_DISPONIBILIDADE",
                "A janela se sobrepõe a uma disponibilidade existente no mesmo dia");
    }
}
