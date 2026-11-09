package br.pucminas.vitalis.profissionais.model;

import br.pucminas.vitalis.comum.model.Campos;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

public final class Disponibilidade {
    private final DayOfWeek diaSemana;
    private final LocalTime inicio;
    private final LocalTime fim;

    public Disponibilidade(DayOfWeek diaSemana, LocalTime inicio, LocalTime fim) {
        Campos.exigir(diaSemana != null && inicio != null && fim != null,
                "Dia e horários de disponibilidade são obrigatórios");
        Campos.exigir(inicio.isBefore(fim), "Disponibilidade deve ter duração positiva no mesmo dia");
        this.diaSemana = diaSemana;
        this.inicio = inicio;
        this.fim = fim;
    }

    public boolean contem(LocalDateTime de, LocalDateTime ate) {
        return de != null && ate != null && de.isBefore(ate)
                && de.toLocalDate().equals(ate.toLocalDate()) && de.getDayOfWeek() == diaSemana
                && !de.toLocalTime().isBefore(inicio) && !ate.toLocalTime().isAfter(fim);
    }
}
