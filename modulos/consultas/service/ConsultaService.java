package br.pucminas.vitalis.consultas.service;

import br.pucminas.vitalis.comum.model.Campos;
import br.pucminas.vitalis.comum.service.*;
import br.pucminas.vitalis.consultas.dto.*;
import br.pucminas.vitalis.consultas.model.*;
import br.pucminas.vitalis.consultas.repository.ConsultaRepository;
import br.pucminas.vitalis.pacientes.model.Paciente;
import br.pucminas.vitalis.pacientes.service.PacienteService;
import br.pucminas.vitalis.profissionais.model.ProfissionalSaude;
import br.pucminas.vitalis.profissionais.service.ProfissionalService;
import org.springframework.stereotype.Service;
import java.time.*;
import java.util.*;
import java.util.function.Consumer;
import java.util.stream.Collectors;

@Service
public class ConsultaService {
    private final ConsultaRepository repository;
    private final PacienteService pacientes;
    private final ProfissionalService profissionais;
    private final AgendaService agenda;
    private final Clock clock;

    public ConsultaService(ConsultaRepository repository, PacienteService pacientes,
                           ProfissionalService profissionais, AgendaService agenda, Clock clock) {
        this.repository = repository;
        this.pacientes = pacientes;
        this.profissionais = profissionais;
        this.agenda = agenda;
        this.clock = clock;
    }

    public ConsultaResponse criar(CriarConsultaRequest dados) {
        synchronized (agenda) {
            Campos.exigir(dados.modalidade != null, "Modalidade é obrigatória");
            Paciente paciente = pacientes.buscarPorId(dados.pacienteId);
            ProfissionalSaude profissional = profissionais.buscarPorId(dados.profissionalId);
            LocalDateTime agora = LocalDateTime.now(clock);
            Long id = repository.proximoId();
            Consulta consulta;
            if (dados.modalidade == ModalidadeConsulta.EMERGENCIA) {
                Campos.exigir(dados.data == null && dados.horario == null && dados.duracaoMinutos == null
                        && dados.especialidade == null, "Emergência não recebe agendamento ou especialidade");
                consulta = new AtendimentoEmergencia(id, paciente, profissional, dados.motivo, agora);
            } else {
                Campos.exigir(dados.data != null && dados.horario != null && dados.duracaoMinutos != null,
                        "Data, horário e duração são obrigatórios para agendamento");
                LocalDateTime inicio = LocalDateTime.of(dados.data, dados.horario);
                Campos.exigir(!inicio.isBefore(agora), "Não é permitido agendar no passado");
                if (dados.modalidade == ModalidadeConsulta.ESPECIALIZADA) {
                    consulta = new ConsultaEspecializada(id, paciente, profissional, inicio,
                            dados.duracaoMinutos, dados.motivo, agora, agenda, dados.especialidade);
                } else {
                    Campos.exigir(dados.especialidade == null, "Rotina não recebe especialidade");
                    consulta = new ConsultaRotina(id, paciente, profissional, inicio,
                            dados.duracaoMinutos, dados.motivo, agora, agenda);
                }
            }
            consulta.validarCondicoes();
            repository.adicionar(consulta);
            return new ConsultaResponse(consulta);
        }
    }

    public ConsultaResponse buscar(Long id) {
        synchronized (agenda) { return new ConsultaResponse(entidade(id)); }
    }

    public List<ConsultaResponse> listar(Long profissionalId, Long pacienteId, LocalDate data,
                                         StatusConsulta status, ModalidadeConsulta modalidade) {
        synchronized (agenda) {
            return repository.listar().stream()
                    .filter(c -> profissionalId == null || c.getProfissional().getId().equals(profissionalId))
                    .filter(c -> pacienteId == null || c.getPaciente().getId().equals(pacienteId))
                    .filter(c -> data == null || c.getInicio().toLocalDate().equals(data))
                    .filter(c -> status == null || c.getStatus() == status)
                    .filter(c -> modalidade == null || c.getModalidade() == modalidade)
                    .sorted(Comparator.comparing(Consulta::getInicio).thenComparing(Consulta::getId))
                    .map(ConsultaResponse::new).collect(Collectors.toList());
        }
    }

    public ConsultaResponse confirmar(Long id) { return alterar(id, Consulta::confirmar); }
    public ConsultaResponse iniciar(Long id) { return alterar(id, Consulta::iniciar); }
    public ConsultaResponse concluir(Long id, String observacoes) { return alterar(id, c -> c.concluir(observacoes)); }
    public ConsultaResponse registrarFalta(Long id) { return alterar(id, Consulta::registrarNaoComparecimento); }
    public ConsultaResponse registrarObservacoes(Long id, String observacoes) {
        return alterar(id, c -> c.registrarObservacoes(observacoes));
    }
    public void cancelar(Long id) { alterar(id, Consulta::cancelar); }

    private ConsultaResponse alterar(Long id, Consumer<Consulta> acao) {
        synchronized (agenda) {
            Consulta consulta = entidade(id);
            acao.accept(consulta);
            return new ConsultaResponse(consulta);
        }
    }

    private Consulta entidade(Long id) {
        return repository.buscarPorId(id).orElseThrow(() -> new RecursoNaoEncontradoException("Consulta", id));
    }
}
