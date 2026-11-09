package br.pucminas.vitalis.profissionais.dto;

import br.pucminas.vitalis.profissionais.model.Disponibilidade;

import java.time.LocalDate;
import java.util.List;

public class AgendaProfissionalResponse {

    private final LocalDate data;
    private final List<Disponibilidade> disponibilidades;

    public AgendaProfissionalResponse(LocalDate data, List<Disponibilidade> disponibilidades) {
        this.data = data;
        this.disponibilidades = disponibilidades;
    }

    public LocalDate getData() {
        return data;
    }

    public List<Disponibilidade> getDisponibilidades() {
        return disponibilidades;
    }
}
