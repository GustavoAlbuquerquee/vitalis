package br.pucminas.vitalis.consultas.model;

import br.pucminas.vitalis.comum.model.Campos;
import br.pucminas.vitalis.comum.service.TransicaoInvalidaException;
import br.pucminas.vitalis.pacientes.model.Paciente;
import br.pucminas.vitalis.profissionais.model.ProfissionalSaude;
import java.time.LocalDateTime;

public class AtendimentoEmergencia extends Consulta {
    private final PrioridadeEmergencia prioridade;
    private LocalDateTime iniciadoEm;
    private LocalDateTime concluidoEm;

    public AtendimentoEmergencia(Long id, Paciente paciente, ProfissionalSaude profissional,
                                 String motivo, LocalDateTime chegada, PrioridadeEmergencia prioridade) {
        super(id, paciente, profissional, motivo, chegada);
        Campos.exigir(prioridade != null, "Prioridade de emergência é obrigatória");
        this.prioridade = prioridade;
        // Chegada já confirma a presença; a API apresenta esta situação como AGUARDANDO.
        super.confirmar();
    }

    @Override public void validarCondicoes() { validarParticipantes(); }
    @Override public LocalDateTime getInicio() { return getCriadoEm(); }
    @Override public LocalDateTime getFim() { return concluidoEm == null ? getInicio() : concluidoEm; }
    @Override public boolean ocupaAgenda() { return false; }
    @Override public ModalidadeConsulta getModalidade() { return ModalidadeConsulta.EMERGENCIA; }

    public PrioridadeEmergencia getPrioridade() { return prioridade; }
    public LocalDateTime getChegada() { return getCriadoEm(); }
    public LocalDateTime getIniciadoEm() { return iniciadoEm; }
    public LocalDateTime getConcluidoEm() { return concluidoEm; }

    @Override public void confirmar() {
        throw new TransicaoInvalidaException("A emergência já tem presença confirmada na chegada");
    }

    @Override public void registrarNaoComparecimento() {
        throw new TransicaoInvalidaException("Não há falta em uma emergência já recebida");
    }

    @Override public void iniciar() { iniciar(LocalDateTime.now()); }
    public void iniciar(LocalDateTime momento) {
        Campos.exigir(momento != null && !momento.isBefore(getChegada()), "Início não pode anteceder a chegada");
        super.iniciar();
        iniciadoEm = momento;
    }

    @Override public void concluir(String observacoes) { concluir(observacoes, LocalDateTime.now()); }
    public void concluir(String observacoes, LocalDateTime momento) {
        if (getStatus() != StatusConsulta.EM_ATENDIMENTO) {
            throw new TransicaoInvalidaException("A emergência precisa estar em atendimento para concluir");
        }
        Campos.exigir(momento != null && !momento.isBefore(iniciadoEm), "Conclusão não pode anteceder o início");
        super.concluir(observacoes);
        concluidoEm = momento;
    }
}
