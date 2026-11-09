package br.pucminas.vitalis.profissionais.model;

public class Especialista extends ProfissionalSaude {

    private Especialidade especialidade;

    public Especialista(Long id, String nome, String registroProfissional,
                        String telefone, String email, boolean ativo, Especialidade especialidade) {
        super(id, nome, registroProfissional, telefone, email, ativo);
        if (especialidade == null || especialidade == Especialidade.CLINICA_GERAL) {
            throw new IllegalArgumentException("O especialista deve possuir uma especialidade específica");
        }
        this.especialidade = especialidade;
    }

    @Override
    public TipoProfissional getTipo() {
        return TipoProfissional.ESPECIALISTA;
    }

    public Especialidade getEspecialidade() {
        return especialidade;
    }

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
