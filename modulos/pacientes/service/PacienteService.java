package br.pucminas.vitalis.pacientes.service;

import br.pucminas.vitalis.pacientes.model.Paciente;

/** Fronteira de leitura; o cadastro da Trilha A fornece a implementação. */
public interface PacienteService {
    Paciente buscarPorId(Long id);
}
