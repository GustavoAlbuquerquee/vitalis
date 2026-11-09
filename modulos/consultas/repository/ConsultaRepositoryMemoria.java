package br.pucminas.vitalis.consultas.repository;

import br.pucminas.vitalis.comum.model.Atendimento;
import br.pucminas.vitalis.comum.service.FonteAgenda;
import br.pucminas.vitalis.consultas.model.Consulta;
import org.springframework.stereotype.Repository;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/** Adaptador temporário enquanto a escolha de banco da ADR 0002 está pendente. */
@Repository
public class ConsultaRepositoryMemoria implements ConsultaRepository, FonteAgenda {
    private final Map<Long, Consulta> consultas = new ConcurrentHashMap<>();
    private final AtomicLong sequencia = new AtomicLong();

    public Long proximoId() { return sequencia.incrementAndGet(); }
    public void adicionar(Consulta consulta) {
        if (consultas.putIfAbsent(consulta.getId(), consulta) != null) {
            throw new IllegalStateException("Identificador de consulta já utilizado");
        }
    }
    public Optional<Consulta> buscarPorId(Long id) { return Optional.ofNullable(consultas.get(id)); }
    public List<Consulta> listar() { return new ArrayList<>(consultas.values()); }
    public List<Atendimento<?, ?>> buscarAtendimentos(Long profissionalId) {
        return consultas.values().stream()
                .filter(c -> c.getProfissional().getId().equals(profissionalId))
                .collect(Collectors.toList());
    }
}
