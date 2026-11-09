package br.pucminas.vitalis.profissionais.model;

public class Cirurgiao extends ProfissionalSaude {

    private String areaCirurgica;

    public Cirurgiao(Long id, String nome, String registroProfissional,
                     String telefone, String email, boolean ativo, String areaCirurgica) {
        super(id, nome, registroProfissional, telefone, email, ativo);
        this.areaCirurgica = areaCirurgica;
    }

    @Override
    public TipoProfissional getTipo() {
        return TipoProfissional.CIRURGIAO;
    }

    public String getAreaCirurgica() {
        return areaCirurgica;
    }

    public void setAreaCirurgica(String areaCirurgica) {
        this.areaCirurgica = areaCirurgica;
    }
}
