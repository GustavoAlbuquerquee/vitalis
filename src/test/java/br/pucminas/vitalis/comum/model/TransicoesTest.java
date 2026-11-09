package br.pucminas.vitalis.comum.model;

import br.pucminas.vitalis.comum.service.TransicaoInvalidaException;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class TransicoesTest {
    enum Estado implements EstadoTransicionavel<Estado> {
        INICIAL, FINAL;
        public boolean permite(Estado destino) { return this == INICIAL && destino == FINAL; }
    }

    @Test
    void validaSemPermitirRetornoRepeticaoOuNulo() {
        assertEquals(Estado.FINAL, Transicoes.validar(Estado.INICIAL, Estado.FINAL));
        assertThrows(TransicaoInvalidaException.class, () -> Transicoes.validar(Estado.FINAL, Estado.INICIAL));
        assertThrows(TransicaoInvalidaException.class, () -> Transicoes.validar(Estado.INICIAL, Estado.INICIAL));
        assertThrows(TransicaoInvalidaException.class, () -> Transicoes.validar(Estado.INICIAL, null));
    }
}
