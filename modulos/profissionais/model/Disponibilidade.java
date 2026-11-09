package br.pucminas.vitalis.profissionais.model;

import br.pucminas.vitalis.comum.model.Campos;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

public final class Disponibilidade {

    private Long id;
    private final DiaSemana diaSemana;
    private final LocalTime horaInicio;
    private final LocalTime horaFim;

    public Disponibilidade(Long id, DiaSemana diaSemana, LocalTime horaInicio, LocalTime horaFim) {
        Campos.exigir(diaSemana != null && horaInicio != null && horaFim != null
                        && horaInicio.isBefore(horaFim),
                "A disponibilidade deve conter um dia e um intervalo válido");
        this.id = id;
        this.diaSemana = diaSemana;
        this.horaInicio = horaInicio;
        this.horaFim = horaFim;
    }

    public Disponibilidade(DayOfWeek diaSemana, LocalTime horaInicio, LocalTime horaFim) {
        this(null, converterDia(diaSemana), horaInicio, horaFim);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public DiaSemana getDiaSemana() { return diaSemana; }
    public LocalTime getHoraInicio() { return horaInicio; }
    public LocalTime getHoraFim() { return horaFim; }

    public boolean sobrepoe(Disponibilidade outra) {
        return diaSemana == outra.diaSemana
                && horaInicio.isBefore(outra.horaFim)
                && outra.horaInicio.isBefore(horaFim);
    }

    public boolean contem(LocalTime inicio, LocalTime fim) {
        return !inicio.isBefore(horaInicio) && !fim.isAfter(horaFim);
    }

    public boolean contem(LocalDateTime inicio, LocalDateTime fim) {
        return inicio != null && fim != null && inicio.isBefore(fim)
                && inicio.toLocalDate().equals(fim.toLocalDate())
                && inicio.getDayOfWeek().getValue() == diaSemana.ordinal() + 1
                && contem(inicio.toLocalTime(), fim.toLocalTime());
    }

    private static DiaSemana converterDia(DayOfWeek diaSemana) {
        Campos.exigir(diaSemana != null, "Dia da semana é obrigatório");
        return DiaSemana.values()[diaSemana.getValue() - 1];
    }
}
