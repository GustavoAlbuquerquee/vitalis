package br.pucminas.vitalis.internacoes.service;

import br.pucminas.vitalis.comum.service.PacienteJaInternadoException;
import br.pucminas.vitalis.comum.service.RecursoNaoEncontradoException;
import br.pucminas.vitalis.comum.service.TransicaoInvalidaException;
import br.pucminas.vitalis.internacoes.dto.InternacaoRequest;
import br.pucminas.vitalis.internacoes.model.Internacao;
import br.pucminas.vitalis.internacoes.model.StatusInternacao;
import br.pucminas.vitalis.pacientes.service.PacienteAtendimentoService;
import br.pucminas.vitalis.profissionais.service.ProfissionalService;
import br.pucminas.vitalis.quartos.model.Quarto;
import br.pucminas.vitalis.quartos.service.QuartoService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class InternacaoService {

    private final Map<Long, Internacao> internacoes = new ConcurrentHashMap<>();
    private final AtomicLong ids = new AtomicLong();
    private final QuartoService quartoService;
    private final PacienteAtendimentoService pacientes;
    private final ProfissionalService profissionais;

    public InternacaoService(QuartoService quartoService, PacienteAtendimentoService pacientes,
                             ProfissionalService profissionais) {
        this.quartoService = quartoService;
        this.pacientes = pacientes;
        this.profissionais = profissionais;
    }

    public synchronized Internacao internar(InternacaoRequest request) {
        boolean pacienteInternado = internacoes.values().stream()
                .anyMatch(i -> i.getPacienteId().equals(request.getPacienteId())
                        && i.getStatus() == StatusInternacao.ATIVA);
        if (pacienteInternado) {
            throw new PacienteJaInternadoException(String.valueOf(request.getPacienteId()));
        }
        Quarto quarto = quartoService.buscarEntidade(request.getQuartoId());
        Long novoId = ids.incrementAndGet();
        Internacao internacao = new Internacao(novoId, pacientes.buscarPorId(request.getPacienteId()),
                profissionais.buscarPorId(request.getProfissionalId()), quarto.getId(), request.getDataEntrada(),
                request.getDataPrevistaAlta(), request.getMotivo(), request.getObservacoes());
        synchronized (quarto) {
            quarto.ocupar(novoId);
            internacoes.put(novoId, internacao);
        }
        return internacao;
    }

    public Internacao buscar(Long id) {
        Internacao internacao = internacoes.get(id);
        if (internacao == null) {
            throw new RecursoNaoEncontradoException("Internação", id);
        }
        return internacao;
    }

    public List<Internacao> listar(StatusInternacao status, Long quartoId, Long pacienteId) {
        return internacoes.values().stream()
                .filter(i -> status == null || i.getStatus() == status)
                .filter(i -> quartoId == null || i.getQuartoId().equals(quartoId))
                .filter(i -> pacienteId == null || i.getPacienteId().equals(pacienteId))
                .sorted(Comparator.comparing(Internacao::getDataEntrada).reversed())
                .collect(Collectors.toList());
    }

    public synchronized Internacao registrarAlta(Long id, LocalDateTime dataEfetivaAlta) {
        Internacao internacao = buscar(id);
        if (internacao.getStatus() != StatusInternacao.ATIVA) {
            throw new TransicaoInvalidaException("Somente uma internação ativa pode receber alta");
        }
        Quarto quarto = quartoService.buscarEntidade(internacao.getQuartoId());
        synchronized (quarto) {
            if (!quarto.getInternacoesAtivas().contains(id)) {
                throw new IllegalStateException("A ocupação do quarto não corresponde à internação ativa");
            }
            internacao.registrarAlta(dataEfetivaAlta);
            quarto.liberar(id);
        }
        return internacao;
    }

    public synchronized Internacao transferir(Long id, Long novoQuartoId) {
        Internacao internacao = buscar(id);
        if (internacao.getStatus() != StatusInternacao.ATIVA) {
            throw new TransicaoInvalidaException("Somente uma internação ativa pode ser transferida");
        }
        if (internacao.getQuartoId().equals(novoQuartoId)) {
            throw new TransicaoInvalidaException("O paciente já está neste quarto");
        }
        Quarto novoQuarto = quartoService.buscarEntidade(novoQuartoId);
        Quarto quartoAtual = quartoService.buscarEntidade(internacao.getQuartoId());
        LocalDateTime dataTransferencia = LocalDateTime.now();
        Long novaInternacaoId = ids.incrementAndGet();
        Internacao novaInternacao = new Internacao(novaInternacaoId, internacao.getPaciente(),
                internacao.getProfissional(), novoQuartoId, dataTransferencia,
                internacao.getDataPrevistaAlta(), internacao.getMotivo(), internacao.getObservacoes());
        synchronized (novoQuarto) {
            synchronized (quartoAtual) {
                if (!quartoAtual.getInternacoesAtivas().contains(id)) {
                    throw new IllegalStateException("A ocupação do quarto não corresponde à internação ativa");
                }
                novoQuarto.ocupar(novaInternacaoId);
                internacao.registrarTransferencia(dataTransferencia);
                quartoAtual.liberar(id);
                internacoes.put(novaInternacaoId, novaInternacao);
            }
        }
        return novaInternacao;
    }
}
