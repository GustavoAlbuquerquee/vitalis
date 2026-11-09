package br.pucminas.vitalis.profissionais.model;

import br.pucminas.vitalis.comum.model.Campos;
import br.pucminas.vitalis.comum.model.Pessoa;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public abstract class ProfissionalSaude extends Pessoa {

    private String registroProfissional;
    private final List<Disponibilidade> disponibilidades = new ArrayList<>();

    protected ProfissionalSaude(Long id, String nome, String registroProfissional,
                                String telefone, String email, boolean ativo) {
        super(id, nome, telefone, email);
        this.registroProfissional = Campos.texto(registroProfissional, "Registro profissional");
        setAtivo(ativo);
    }

    protected ProfissionalSaude(Long id, String nome, String telefone, String email,
                                String registro, List<Disponibilidade> disponibilidades) {
        this(id, nome, registro, telefone, email, true);
        Campos.exigir(disponibilidades != null && !disponibilidades.contains(null),
                "Lista de disponibilidades é obrigatória e não admite nulos");
        for (Disponibilidade disponibilidade : disponibilidades) {
            adicionarDisponibilidade(disponibilidade);
        }
    }

    public String getRegistroProfissional() { return registroProfissional; }

    public void setRegistroProfissional(String registroProfissional) {
        this.registroProfissional = Campos.texto(registroProfissional, "Registro profissional");
    }

    public List<Disponibilidade> getDisponibilidades() {
        return Collections.unmodifiableList(disponibilidades);
    }

    public void adicionarDisponibilidade(Disponibilidade nova) {
        Campos.exigir(nova != null, "Disponibilidade é obrigatória");
        if (disponibilidades.stream().anyMatch(existente -> existente.sobrepoe(nova))) {
            throw new IllegalArgumentException("A disponibilidade se sobrepõe a uma janela existente");
        }
        disponibilidades.add(nova);
    }

    public boolean estaDisponivelEm(LocalDateTime inicio, LocalDateTime fim) {
        return disponibilidades.stream().anyMatch(janela -> janela.contem(inicio, fim));
    }

    @Override
    public String getIdentificacaoPrincipal() { return registroProfissional; }
}
