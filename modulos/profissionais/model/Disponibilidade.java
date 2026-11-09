package br.pucminas.vitalis.profissionais.model;

import java.time.LocalTime;

public class Disponibilidade {

    private Long id;
    private final DiaSemana diaSemana;
    private final LocalTime horaInicio;
    private final LocalTime horaFim;

    public Disponibilidade(Long id, DiaSemana diaSemana, LocalTime horaInicio, LocalTime horaFim) {
        if (diaSemana == null || horaInicio == null || horaFim == null
                || !horaInicio.isBefore(horaFim)) {
            throw new IllegalArgumentException("A disponibilidade deve conter um dia e um intervalo válido");
        }
        this.id = id;
        this.diaSemana = diaSemana;
        this.horaInicio = horaInicio;
        this.horaFim = horaFim;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DiaSemana getDiaSemana() {
        return diaSemana;
    }

    public LocalTime getHoraInicio() {
        return horaInicio;
    }

    public LocalTime getHoraFim() {
        return horaFim;
    }

    public boolean sobrepoe(Disponibilidade outra) {
        return diaSemana == outra.diaSemana
                && horaInicio.isBefore(outra.horaFim)
                && outra.horaInicio.isBefore(horaFim);
    }

    public boolean contem(LocalTime inicio, LocalTime fim) {
        return !inicio.isBefore(horaInicio) && !fim.isAfter(horaFim);
    }
}
