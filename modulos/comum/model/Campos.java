package br.pucminas.vitalis.comum.model;

import br.pucminas.vitalis.comum.service.DadosInvalidosException;
import java.util.Collections;

public final class Campos {
    private Campos() { }

    public static void exigir(boolean condicao, String mensagem) {
        if (!condicao) {
            throw new DadosInvalidosException(mensagem, Collections.emptyList());
        }
    }

    public static String texto(String valor, String campo) {
        exigir(valor != null && !valor.trim().isEmpty(), campo + " é obrigatório");
        return valor.trim();
    }
}
