package br.pucminas.vitalis.comum.service;

import org.springframework.http.HttpStatus;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class DadosInvalidosException extends HospitalException {

    public DadosInvalidosException(Map<String, String> erros) {
        super("DADOS_INVALIDOS", HttpStatus.BAD_REQUEST, "Os dados informados são inválidos",
                toDetails(erros));
    }

    public DadosInvalidosException(String mensagem, List<String> detalhes) {
        super("DADOS_INVALIDOS", HttpStatus.BAD_REQUEST, mensagem, detalhes);
    }

    private static List<String> toDetails(Map<String, String> erros) {
        if (erros == null || erros.isEmpty()) {
            return Collections.emptyList();
        }
        return erros.entrySet().stream()
                .map(erro -> erro.getKey() + ": " + erro.getValue())
                .collect(Collectors.toList());
    }
}
