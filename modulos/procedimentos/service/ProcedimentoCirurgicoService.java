package br.pucminas.vitalis.procedimentos.service;

import br.pucminas.vitalis.comum.service.AgendaService;
import br.pucminas.vitalis.comum.service.RecursoNaoEncontradoException;
import br.pucminas.vitalis.profissionais.model.Cirurgiao;
import br.pucminas.vitalis.profissionais.service.ProfissionalService;
import br.pucminas.vitalis.pacientes.service.PacienteAtendimentoService;
import br.pucminas.vitalis.procedimentos.dto.ProcedimentoCirurgicoRequest;
import br.pucminas.vitalis.procedimentos.model.ProcedimentoCirurgico;
import br.pucminas.vitalis.procedimentos.repository.ProcedimentoRepositoryMemoria;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProcedimentoCirurgicoService {

    private final ProcedimentoRepositoryMemoria repository;
    private final ProfissionalService profissionalService;
    private final PacienteAtendimentoService pacienteService;
    private final AgendaService agenda;

    public ProcedimentoCirurgicoService(ProcedimentoRepositoryMemoria repository,
                                        ProfissionalService profissionalService,
                                        PacienteAtendimentoService pacienteService,
                                        AgendaService agenda) {
        this.repository = repository;
        this.profissionalService = profissionalService;
        this.pacienteService = pacienteService;
        this.agenda = agenda;
    }

    public ProcedimentoCirurgico cadastrar(ProcedimentoCirurgicoRequest request) {
        synchronized (agenda) {
            Cirurgiao cirurgiao = profissionalService.buscarCirurgiao(request.getCirurgiaoId());
            ProcedimentoCirurgico procedimento = new ProcedimentoCirurgico(repository.proximoId(),
                    pacienteService.buscarPorId(request.getPacienteId()), cirurgiao,
                    request.getDescricao(), request.getTipoCirurgia(),
                    request.getObservacoesPreOperatorias(), request.getDataHoraPrevista());
            agenda.validarAusenciaDeConflito(procedimento);
            repository.adicionar(procedimento);
            return procedimento;
        }
    }

    public ProcedimentoCirurgico buscar(Long id) {
        return repository.buscarPorId(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Procedimento cirúrgico", id));
    }

    public List<ProcedimentoCirurgico> listar(Long cirurgiaoId) {
        if (cirurgiaoId != null) {
            profissionalService.buscarCirurgiao(cirurgiaoId);
        }
        return repository.listar().stream()
                .filter(p -> cirurgiaoId == null || p.getCirurgiao().getId().equals(cirurgiaoId))
                .sorted(Comparator.comparing(ProcedimentoCirurgico::getDataHoraPrevista))
                .collect(Collectors.toList());
    }

    public ProcedimentoCirurgico iniciar(Long id, LocalDateTime dataHoraEfetiva) {
        synchronized (agenda) {
            ProcedimentoCirurgico procedimento = buscar(id);
            agenda.validarAusenciaDeConflito(
                    procedimento.prepararInicio(dataHoraEfetiva), procedimento);
            procedimento.iniciar(dataHoraEfetiva);
            return procedimento;
        }
    }

    public ProcedimentoCirurgico concluir(Long id, LocalDateTime dataHoraEfetiva,
                                          String observacoesPosOperatorias) {
        synchronized (agenda) {
            ProcedimentoCirurgico procedimento = buscar(id);
            procedimento.concluir(dataHoraEfetiva, observacoesPosOperatorias);
            return procedimento;
        }
    }

    public ProcedimentoCirurgico cancelar(Long id) {
        synchronized (agenda) {
            ProcedimentoCirurgico procedimento = buscar(id);
            procedimento.cancelar();
            return procedimento;
        }
    }
}
