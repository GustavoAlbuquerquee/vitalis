package br.pucminas.vitalis.comum.model;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class AtendimentoTest {
    @ParameterizedTest
    @CsvSource({"9, 12, true", "9, 11, true", "11, 13, true", "10, 12, true",
            "8, 10, false", "12, 14, false", "13, 14, false"})
    void comparaIntervalosNasDuasDirecoes(int inicio, int fim, boolean esperado) {
        Atendimento<?, ?> base = atendimento(10, 12);
        Atendimento<?, ?> outro = atendimento(inicio, fim);
        assertEquals(esperado, base.conflitaCom(outro));
        assertEquals(esperado, outro.conflitaCom(base));
    }

    private Atendimento<?, ?> atendimento(int inicio, int fim) {
        Pessoa pessoa = new Pessoa(1L, "Teste", null, null) {
            public String getIdentificacaoPrincipal() { return "123"; }
        };
        return new Atendimento<Pessoa, Pessoa>(1L, pessoa, pessoa, LocalDateTime.now()) {
            public LocalDateTime getInicio() { return LocalDateTime.of(2030, 1, 1, inicio, 0); }
            public LocalDateTime getFim() { return LocalDateTime.of(2030, 1, 1, fim, 0); }
            public void validarCondicoes() { }
        };
    }
}
