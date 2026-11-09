package br.pucminas.vitalis.pacientes.repository;

import br.pucminas.vitalis.pacientes.model.Paciente;

import java.util.List;
import java.util.Optional;

/**
 * Acesso aos dados de paciente.
 *
 * <p>É interface de propósito: a Sprint 2 cobra domínio e API, não
 * persistência (ADR 0002 segue em aberto). A implementação de hoje guarda
 * em memória; trocar por JPA na Sprint 3 não toca em nenhuma regra de
 * negócio, porque o serviço só conhece este contrato.
 */
public interface PacienteRepository {

    Paciente salvar(Paciente paciente);

    Optional<Paciente> buscarPorId(Long id);

    Optional<Paciente> buscarPorCpf(String cpf);

    boolean existePorCpf(String cpf);

    /** Somente ativos, ordenados por nome. Filtros vazios não filtram. */
    List<Paciente> listar(String nome, String cpf);

    void remover(Long id);
}
