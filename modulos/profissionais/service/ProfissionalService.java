package br.pucminas.vitalis.profissionais.service;

import br.pucminas.vitalis.profissionais.model.ProfissionalSaude;

/** Fronteira de leitura; o cadastro da Trilha A fornece a implementação. */
public interface ProfissionalService {
    ProfissionalSaude buscarPorId(Long id);
}
