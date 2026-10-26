package br.pucminas.vitalis.comum.service;

public class PacienteJaInternadoException extends RegraDeNegocioException {

    private final String cpf;

    public PacienteJaInternadoException(String cpf) {
        super("PACIENTE_JA_INTERNADO", "O paciente informado já possui internação ativa");
        this.cpf = cpf;
    }

    public String getCpf() {
        return cpf;
    }
}
