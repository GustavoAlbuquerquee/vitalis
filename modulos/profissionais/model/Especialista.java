package br.pucminas.vitalis.profissionais.model;

import java.util.List;

public class Especialista extends ProfissionalSaude {

    private Especialidade especialidade;

    public Especialista(Long id, String nome, String registroProfissional,
                        String telefone, String email, boolean ativo, Especialidade especialidade) {
        super(id, nome, registroProfissional, telefone, email, ativo);
        setEspecialidade(especialidade);
    }

    public Especialista(Long id, String nome, String telefone, String email,
                         String registro, Especialidade especialidade,
                         List<Disponibilidade> disponibilidades) {
        super(id, nome, telefone, email, registro, disponibilidades);
        setEspecialidade(especialidade);
    }

    @Override
    public String getTipo() { return TipoProfissional.ESPECIALISTA.name(); }

    public Especialidade getEspecialidade() { return especialidade; }

    public void setEspecialidade(Especialidade especialidade) {
        if (especialidade == null || especialidade == Especialidade.CLINICA_GERAL) {
            throw new IllegalArgumentException("O especialista deve possuir uma especialidade específica");
        }
        this.especialidade = especialidade;
    }

    public boolean atendeNaEspecialidade(Especialidade solicitada) {
        return especialidade == solicitada;
    }
}
