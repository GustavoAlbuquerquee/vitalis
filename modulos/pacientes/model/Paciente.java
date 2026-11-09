package br.pucminas.vitalis.pacientes.model;

import br.pucminas.vitalis.comum.model.Campos;
import br.pucminas.vitalis.comum.model.Pessoa;

/** Núcleo de identificação necessário às consultas; o cadastro completo pertence à Trilha A. */
public class Paciente extends Pessoa {
    private final String cpf;

    public Paciente(Long id, String nome, String telefone, String email, String cpf) {
        super(id, nome, telefone, email);
        this.cpf = Campos.texto(cpf, "CPF");
    }

    public String getCpf() { return cpf; }
    @Override public String getIdentificacaoPrincipal() { return cpf; }
}
