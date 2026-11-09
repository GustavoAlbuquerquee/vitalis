package br.pucminas.vitalis.profissionais.model;

import java.util.List;

public class ClinicoGeral extends ProfissionalSaude {
    public ClinicoGeral(Long id, String nome, String telefone, String email,
                        String registro, List<Disponibilidade> disponibilidades) {
        super(id, nome, telefone, email, registro, Especialidade.CLINICA_GERAL, disponibilidades);
    }
}
