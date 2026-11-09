package br.pucminas.vitalis.pacientes.service;

import br.pucminas.vitalis.pacientes.model.Paciente;

/** Contrato estreito para que consultas obtenham o paciente pelo serviço do módulo. */
public interface PacienteAtendimentoService {
    Paciente buscarPorId(Long id);
}
