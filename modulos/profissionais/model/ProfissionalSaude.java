package br.pucminas.vitalis.profissionais.model;

import br.pucminas.vitalis.comum.model.Pessoa;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public abstract class ProfissionalSaude extends Pessoa {

    private String registroProfissional;
    private final List<Disponibilidade> disponibilidades = new ArrayList<>();

    protected ProfissionalSaude(Long id, String nome, String registroProfissional,
                                String telefone, String email, boolean ativo) {
        super(id, nome, telefone, email, ativo);
        this.registroProfissional = registroProfissional;
    }

    public abstract TipoProfissional getTipo();

    public String getRegistroProfissional() {
        return registroProfissional;
    }

    public void setRegistroProfissional(String registroProfissional) {
        this.registroProfissional = registroProfissional;
    }

    public List<Disponibilidade> getDisponibilidades() {
        return Collections.unmodifiableList(disponibilidades);
    }

    public void adicionarDisponibilidade(Disponibilidade nova) {
        for (Disponibilidade existente : disponibilidades) {
            if (existente.sobrepoe(nova)) {
                throw new IllegalArgumentException("A disponibilidade se sobrepõe a uma janela existente");
            }
        }
        disponibilidades.add(nova);
    }

    public boolean estaDisponivelEm(java.time.LocalDateTime inicio, java.time.LocalDateTime fim) {
        DiaSemana dia = DiaSemana.values()[inicio.getDayOfWeek().getValue() - 1];
        if (!inicio.toLocalDate().equals(fim.toLocalDate())) {
            return false;
        }
        for (Disponibilidade disponibilidade : disponibilidades) {
            if (disponibilidade.getDiaSemana() == dia
                    && disponibilidade.contem(inicio.toLocalTime(), fim.toLocalTime())) {
                return true;
            }
        }
        return false;
    }
}
