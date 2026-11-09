package br.pucminas.vitalis.profissionais.model;

import java.util.List;

public class Especialista extends ProfissionalSaude {
    public Especialista(Long id, String nome, String telefone, String email,
                         String registro, Especialidade especialidade,
                         List<Disponibilidade> disponibilidades) {
        super(id, nome, telefone, email, registro, especialidade, disponibilidades);
    }
    @Override public String getTipo() { return "ESPECIALISTA"; }
}
