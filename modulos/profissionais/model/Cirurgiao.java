package br.pucminas.vitalis.profissionais.model;

import br.pucminas.vitalis.comum.model.Campos;

import java.util.List;

public class Cirurgiao extends ProfissionalSaude {

    private String areaCirurgica;

    public Cirurgiao(Long id, String nome, String registroProfissional,
                     String telefone, String email, boolean ativo, String areaCirurgica) {
        super(id, nome, registroProfissional, telefone, email, ativo);
        setAreaCirurgica(areaCirurgica);
    }

    public Cirurgiao(Long id, String nome, String telefone, String email,
                     String registro, String areaCirurgica, List<Disponibilidade> disponibilidades) {
        super(id, nome, telefone, email, registro, disponibilidades);
        setAreaCirurgica(areaCirurgica);
    }

    @Override
    public String getTipo() { return TipoProfissional.CIRURGIAO.name(); }

    public String getAreaCirurgica() {
        return areaCirurgica;
    }

    public void setAreaCirurgica(String areaCirurgica) {
        this.areaCirurgica = Campos.texto(areaCirurgica, "Área cirúrgica");
    }
}
