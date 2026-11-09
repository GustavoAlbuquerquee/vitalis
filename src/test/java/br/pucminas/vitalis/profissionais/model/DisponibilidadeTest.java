package br.pucminas.vitalis.profissionais.model;

import br.pucminas.vitalis.comum.service.DadosInvalidosException;
import org.junit.jupiter.api.Test;
import java.time.*;
import static org.junit.jupiter.api.Assertions.*;

class DisponibilidadeTest {
    @Test
    void exigeQueTodoIntervaloEstejaNaJanelaDoDia() {
        LocalDateTime inicio = LocalDateTime.of(2030, 1, 7, 8, 0);
        Disponibilidade janela = new Disponibilidade(DayOfWeek.MONDAY,
                LocalTime.of(8, 0), LocalTime.of(12, 0));
        assertTrue(janela.contem(inicio, inicio.plusHours(4)));
        assertFalse(janela.contem(inicio.minusMinutes(1), inicio.plusHours(1)));
        assertFalse(janela.contem(inicio, inicio.plusHours(4).plusMinutes(1)));
        assertFalse(janela.contem(inicio.plusDays(1), inicio.plusDays(1).plusHours(1)));
        assertFalse(janela.contem(inicio, inicio.plusDays(1)));
        assertThrows(DadosInvalidosException.class, () -> new Disponibilidade(
                DayOfWeek.MONDAY, LocalTime.NOON, LocalTime.NOON));
    }
}
