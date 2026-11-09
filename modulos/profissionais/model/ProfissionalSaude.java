package br.pucminas.vitalis.profissionais.model;

import br.pucminas.vitalis.comum.model.Campos;
import br.pucminas.vitalis.comum.model.Pessoa;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public abstract class ProfissionalSaude extends Pessoa {
    private final String registroProfissional;
    private final Especialidade especialidade;
    private final List<Disponibilidade> disponibilidades;

    protected ProfissionalSaude(Long id, String nome, String telefone, String email,
                                String registro, Especialidade especialidade,
                                List<Disponibilidade> disponibilidades) {
        super(id, nome, telefone, email);
        this.registroProfissional = Campos.texto(registro, "Registro profissional");
        Campos.exigir(especialidade != null, "Especialidade é obrigatória");
        Campos.exigir(disponibilidades != null && !disponibilidades.contains(null),
                "Lista de disponibilidades é obrigatória e não admite nulos");
        this.especialidade = especialidade;
        this.disponibilidades = Collections.unmodifiableList(new ArrayList<>(disponibilidades));
    }

    public boolean estaDisponivelEm(LocalDateTime inicio, LocalDateTime fim) {
        return disponibilidades.stream().anyMatch(janela -> janela.contem(inicio, fim));
    }

    public Especialidade getEspecialidade() { return especialidade; }
    public String getRegistroProfissional() { return registroProfissional; }
    @Override public String getIdentificacaoPrincipal() { return registroProfissional; }
}
