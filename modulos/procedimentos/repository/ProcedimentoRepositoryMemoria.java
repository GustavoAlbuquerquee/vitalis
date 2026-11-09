package br.pucminas.vitalis.procedimentos.repository;

import br.pucminas.vitalis.comum.model.Atendimento;
import br.pucminas.vitalis.comum.service.FonteAgenda;
import br.pucminas.vitalis.procedimentos.model.ProcedimentoCirurgico;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Repository
public class ProcedimentoRepositoryMemoria implements FonteAgenda {

    private final ConcurrentHashMap<Long, ProcedimentoCirurgico> procedimentos = new ConcurrentHashMap<>();
    private final AtomicLong sequencia = new AtomicLong();

    public Long proximoId() { return sequencia.incrementAndGet(); }

    public void adicionar(ProcedimentoCirurgico procedimento) {
        if (procedimentos.putIfAbsent(procedimento.getId(), procedimento) != null) {
            throw new IllegalStateException("Identificador de procedimento já utilizado");
        }
    }

    public Optional<ProcedimentoCirurgico> buscarPorId(Long id) {
        return Optional.ofNullable(procedimentos.get(id));
    }

    public List<ProcedimentoCirurgico> listar() {
        return new ArrayList<>(procedimentos.values());
    }

    @Override
    public List<Atendimento<?, ?>> buscarAtendimentos(Long profissionalId) {
        return procedimentos.values().stream()
                .filter(p -> p.getProfissional().getId().equals(profissionalId))
                .collect(Collectors.toList());
    }
}
