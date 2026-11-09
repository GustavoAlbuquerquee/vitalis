package br.pucminas.vitalis.comum.service;

import br.pucminas.vitalis.comum.model.Atendimento;
import java.util.List;

/** Cada módulo fornece seus atendimentos sem expor seu repositório aos demais. */
public interface FonteAgenda {
    List<Atendimento<?, ?>> buscarAtendimentos(Long profissionalId);
}
