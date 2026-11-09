package br.pucminas.vitalis.comum.service;

public class RegistroProfissionalDuplicadoException extends RegraDeNegocioException {

    public RegistroProfissionalDuplicadoException(String registro) {
        super("REGISTRO_PROFISSIONAL_DUPLICADO",
                "O registro profissional " + registro + " já está cadastrado");
    }
}
