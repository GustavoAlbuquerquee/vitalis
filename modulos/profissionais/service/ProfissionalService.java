package br.pucminas.vitalis.profissionais.service;

import br.pucminas.vitalis.comum.service.ConflitoDisponibilidadeException;
import br.pucminas.vitalis.comum.service.DadosInvalidosException;
import br.pucminas.vitalis.comum.service.RecursoNaoEncontradoException;
import br.pucminas.vitalis.comum.service.RegistroProfissionalDuplicadoException;
import br.pucminas.vitalis.profissionais.dto.ProfissionalRequest;
import br.pucminas.vitalis.profissionais.dto.AgendaProfissionalResponse;
import br.pucminas.vitalis.profissionais.model.Cirurgiao;
import br.pucminas.vitalis.profissionais.model.ClinicoGeral;
import br.pucminas.vitalis.profissionais.model.Disponibilidade;
import br.pucminas.vitalis.profissionais.model.DiaSemana;
import br.pucminas.vitalis.profissionais.model.Encaminhamento;
import br.pucminas.vitalis.profissionais.model.Especialidade;
import br.pucminas.vitalis.profissionais.model.Especialista;
import br.pucminas.vitalis.profissionais.model.ProfissionalSaude;
import br.pucminas.vitalis.profissionais.model.TipoProfissional;
import br.pucminas.vitalis.profissionais.dto.DisponibilidadeRequest;
import br.pucminas.vitalis.profissionais.dto.EncaminhamentoRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class ProfissionalService {

    private final Map<Long, ProfissionalSaude> profissionais = new ConcurrentHashMap<>();
    private final Map<Long, List<Encaminhamento>> encaminhamentos = new ConcurrentHashMap<>();
    private final AtomicLong ids = new AtomicLong();
    private final AtomicLong disponibilidadeIds = new AtomicLong();

    public synchronized ProfissionalSaude cadastrar(ProfissionalRequest request) {
        validarRegistroUnico(request.getRegistroProfissional(), null);
        ProfissionalSaude profissional = criar(ids.incrementAndGet(), request);
        profissionais.put(profissional.getId(), profissional);
        return profissional;
    }

    public synchronized ProfissionalSaude atualizar(Long id, ProfissionalRequest request) {
        ProfissionalSaude atual = buscar(id);
        validarRegistroUnico(request.getRegistroProfissional(), id);
        if (atual.getTipo() != request.getTipo()) {
            throw new DadosInvalidosException("A categoria do profissional não pode ser alterada após o cadastro",
                    java.util.Collections.singletonList("tipo: incompatível com o cadastro existente"));
        }
        ProfissionalSaude validado = criar(id, request);
        atual.setNome(validado.getNome());
        atual.setRegistroProfissional(validado.getRegistroProfissional());
        atual.setTelefone(validado.getTelefone());
        atual.setEmail(validado.getEmail());
        atual.setAtivo(validado.isAtivo());
        if (atual instanceof Especialista) {
            ((Especialista) atual).setEspecialidade(((Especialista) validado).getEspecialidade());
        } else if (atual instanceof Cirurgiao) {
            ((Cirurgiao) atual).setAreaCirurgica(((Cirurgiao) validado).getAreaCirurgica());
        }
        return atual;
    }

    public ProfissionalSaude buscar(Long id) {
        ProfissionalSaude profissional = profissionais.get(id);
        if (profissional == null) {
            throw new RecursoNaoEncontradoException("Profissional", id);
        }
        return profissional;
    }

    public Cirurgiao buscarCirurgiao(Long id) {
        ProfissionalSaude profissional = buscar(id);
        if (!(profissional instanceof Cirurgiao)) {
            throw new DadosInvalidosException("O profissional responsável deve ser um cirurgião",
                    java.util.Collections.singletonList("profissionalId: tipo incompatível"));
        }
        return (Cirurgiao) profissional;
    }

    public List<ProfissionalSaude> listar(Especialidade especialidade, TipoProfissional tipo) {
        return profissionais.values().stream()
                .filter(p -> tipo == null || p.getTipo() == tipo)
                .filter(p -> especialidade == null
                        || (p instanceof Especialista
                        && ((Especialista) p).getEspecialidade() == especialidade)
                        || (p instanceof ClinicoGeral && especialidade == Especialidade.CLINICA_GERAL))
                .sorted(Comparator.comparing(ProfissionalSaude::getNome))
                .collect(Collectors.toList());
    }

    public synchronized Disponibilidade adicionarDisponibilidade(Long id, DisponibilidadeRequest request) {
        ProfissionalSaude profissional = buscar(id);
        Disponibilidade nova;
        try {
            nova = new Disponibilidade(disponibilidadeIds.incrementAndGet(), request.getDiaSemana(),
                    request.getHoraInicio(), request.getHoraFim());
        } catch (IllegalArgumentException exception) {
            throw new DadosInvalidosException(exception.getMessage(), java.util.Collections.<String>emptyList());
        }
        try {
            profissional.adicionarDisponibilidade(nova);
        } catch (IllegalArgumentException exception) {
            throw new ConflitoDisponibilidadeException();
        }
        return nova;
    }

    public synchronized Encaminhamento encaminhar(Long id, EncaminhamentoRequest request) {
        ProfissionalSaude profissional = buscar(id);
        if (!(profissional instanceof ClinicoGeral)) {
            throw new DadosInvalidosException("Somente o clínico geral pode encaminhar pacientes",
                    java.util.Collections.singletonList("profissionalId: tipo incompatível"));
        }
        Encaminhamento encaminhamento;
        try {
            encaminhamento = ((ClinicoGeral) profissional).encaminhar(
                    request.getPacienteId(), request.getEspecialidade(), request.getMotivo());
        } catch (IllegalArgumentException exception) {
            throw new DadosInvalidosException(exception.getMessage(), java.util.Collections.<String>emptyList());
        }
        encaminhamentos.computeIfAbsent(id, chave -> new ArrayList<>()).add(encaminhamento);
        return encaminhamento;
    }

    public synchronized List<Encaminhamento> listarEncaminhamentos(Long id) {
        buscar(id);
        return new ArrayList<>(encaminhamentos.getOrDefault(id, java.util.Collections.<Encaminhamento>emptyList()));
    }

    public AgendaProfissionalResponse agenda(Long id, LocalDate data) {
        ProfissionalSaude profissional = buscar(id);
        DiaSemana dia = DiaSemana.values()[data.getDayOfWeek().getValue() - 1];
        List<Disponibilidade> janelas = profissional.getDisponibilidades().stream()
                .filter(disponibilidade -> disponibilidade.getDiaSemana() == dia)
                .sorted(Comparator.comparing(Disponibilidade::getHoraInicio))
                .collect(Collectors.toList());
        return new AgendaProfissionalResponse(data, janelas);
    }

    private ProfissionalSaude criar(Long id, ProfissionalRequest request) {
        TipoProfissional tipo = request.getTipo();
        if (tipo == TipoProfissional.CLINICO_GERAL) {
            return new ClinicoGeral(id, request.getNome(), request.getRegistroProfissional(),
                    request.getTelefone(), request.getEmail(), request.isAtivo());
        }
        if (tipo == TipoProfissional.ESPECIALISTA) {
            try {
                return new Especialista(id, request.getNome(), request.getRegistroProfissional(),
                        request.getTelefone(), request.getEmail(), request.isAtivo(), request.getEspecialidade());
            } catch (IllegalArgumentException exception) {
                throw new DadosInvalidosException(exception.getMessage(), java.util.Collections.<String>emptyList());
            }
        }
        if (request.getAreaCirurgica() == null || request.getAreaCirurgica().trim().isEmpty()) {
            throw new DadosInvalidosException("Cirurgião deve informar sua área cirúrgica",
                    java.util.Collections.singletonList("areaCirurgica: obrigatório"));
        }
        return new Cirurgiao(id, request.getNome(), request.getRegistroProfissional(),
                request.getTelefone(), request.getEmail(), request.isAtivo(), request.getAreaCirurgica());
    }

    private void validarRegistroUnico(String registro, Long idIgnorado) {
        String chave = normalizarRegistro(registro);
        boolean duplicado = profissionais.values().stream()
                .anyMatch(p -> !p.getId().equals(idIgnorado)
                        && normalizarRegistro(p.getRegistroProfissional()).equals(chave));
        if (duplicado) {
            throw new RegistroProfissionalDuplicadoException(registro);
        }
    }

    private String normalizarRegistro(String registro) {
        return registro.replaceAll("[^A-Za-z0-9]", "").toUpperCase(Locale.ROOT);
    }
}
