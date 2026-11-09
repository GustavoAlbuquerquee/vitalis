package br.pucminas.vitalis.procedimentos.service;

import br.pucminas.vitalis.comum.service.RecursoNaoEncontradoException;
import br.pucminas.vitalis.profissionais.model.Cirurgiao;
import br.pucminas.vitalis.profissionais.service.ProfissionalService;
import br.pucminas.vitalis.procedimentos.dto.ProcedimentoCirurgicoRequest;
import br.pucminas.vitalis.procedimentos.model.ProcedimentoCirurgico;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class ProcedimentoCirurgicoService {

    private final Map<Long, ProcedimentoCirurgico> procedimentos = new ConcurrentHashMap<>();
    private final AtomicLong ids = new AtomicLong();
    private final ProfissionalService profissionalService;

    public ProcedimentoCirurgicoService(ProfissionalService profissionalService) {
        this.profissionalService = profissionalService;
    }

    public synchronized ProcedimentoCirurgico cadastrar(ProcedimentoCirurgicoRequest request) {
        Cirurgiao cirurgiao = profissionalService.buscarCirurgiao(request.getCirurgiaoId());
        ProcedimentoCirurgico procedimento = new ProcedimentoCirurgico(
                ids.incrementAndGet(), request.getPacienteId(), cirurgiao,
                request.getDescricao(), request.getTipoCirurgia(),
                request.getObservacoesPreOperatorias(), request.getDataHoraPrevista());
        procedimentos.put(procedimento.getId(), procedimento);
        return procedimento;
    }

    public ProcedimentoCirurgico buscar(Long id) {
        ProcedimentoCirurgico procedimento = procedimentos.get(id);
        if (procedimento == null) {
            throw new RecursoNaoEncontradoException("Procedimento cirúrgico", id);
        }
        return procedimento;
    }

    public List<ProcedimentoCirurgico> listar(Long cirurgiaoId) {
        if (cirurgiaoId != null) {
            profissionalService.buscarCirurgiao(cirurgiaoId);
        }
        return procedimentos.values().stream()
                .filter(p -> cirurgiaoId == null || p.getCirurgiao().getId().equals(cirurgiaoId))
                .sorted(Comparator.comparing(ProcedimentoCirurgico::getDataHoraPrevista))
                .collect(Collectors.toList());
    }

    public synchronized ProcedimentoCirurgico iniciar(Long id, LocalDateTime dataHoraEfetiva) {
        ProcedimentoCirurgico procedimento = buscar(id);
        procedimento.iniciar(dataHoraEfetiva);
        return procedimento;
    }

    public synchronized ProcedimentoCirurgico concluir(Long id, LocalDateTime dataHoraEfetiva,
                                          String observacoesPosOperatorias) {
        ProcedimentoCirurgico procedimento = buscar(id);
        procedimento.concluir(dataHoraEfetiva, observacoesPosOperatorias);
        return procedimento;
    }

    public synchronized ProcedimentoCirurgico cancelar(Long id) {
        ProcedimentoCirurgico procedimento = buscar(id);
        procedimento.cancelar();
        return procedimento;
    }
}
