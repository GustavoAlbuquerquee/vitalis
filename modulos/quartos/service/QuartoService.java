package br.pucminas.vitalis.quartos.service;

import br.pucminas.vitalis.comum.service.DadosInvalidosException;
import br.pucminas.vitalis.comum.service.RecursoNaoEncontradoException;
import br.pucminas.vitalis.comum.service.NumeroQuartoDuplicadoException;
import br.pucminas.vitalis.quartos.dto.QuartoRequest;
import br.pucminas.vitalis.quartos.model.Quarto;
import br.pucminas.vitalis.quartos.model.SituacaoQuarto;
import br.pucminas.vitalis.quartos.model.TipoQuarto;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class QuartoService {

    private final Map<Long, Quarto> quartos = new ConcurrentHashMap<>();
    private final AtomicLong ids = new AtomicLong();

    public synchronized Quarto cadastrar(QuartoRequest request) {
        boolean numeroExiste = quartos.values().stream()
                .anyMatch(q -> q.getNumero().equalsIgnoreCase(request.getNumero().trim()));
        if (numeroExiste) {
            throw new NumeroQuartoDuplicadoException(request.getNumero());
        }
        Quarto quarto = new Quarto(ids.incrementAndGet(), request.getNumero().trim(),
                request.getAndar(), request.getCapacidadeMaxima(), request.getTipo());
        quartos.put(quarto.getId(), quarto);
        return quarto;
    }

    public Quarto buscar(Long id) {
        Quarto quarto = quartos.get(id);
        if (quarto == null) {
            throw new RecursoNaoEncontradoException("Quarto", id);
        }
        return quarto;
    }

    public Quarto buscarEntidade(Long id) {
        return buscar(id);
    }

    public List<Quarto> listar(SituacaoQuarto situacao, Integer andar, TipoQuarto tipo) {
        return quartos.values().stream()
                .filter(q -> situacao == null || q.getSituacao() == situacao)
                .filter(q -> andar == null || q.getAndar() == andar)
                .filter(q -> tipo == null || q.getTipo() == tipo)
                .sorted(Comparator.comparing(Quarto::getNumero))
                .collect(Collectors.toList());
    }

    public synchronized Quarto atualizarBloqueio(Long id, SituacaoQuarto situacao) {
        Quarto quarto = buscar(id);
        if (situacao != SituacaoQuarto.MANUTENCAO && situacao != SituacaoQuarto.INTERDITADO
                && situacao != SituacaoQuarto.DISPONIVEL) {
            throw new DadosInvalidosException("A situação administrativa deve ser manutenção, interdição ou disponível",
                    java.util.Collections.<String>emptyList());
        }
        synchronized (quarto) {
            try {
                quarto.definirBloqueio(situacao == SituacaoQuarto.DISPONIVEL ? null : situacao);
            } catch (IllegalArgumentException exception) {
                throw new DadosInvalidosException(exception.getMessage(), java.util.Collections.<String>emptyList());
            }
        }
        return quarto;
    }
}
