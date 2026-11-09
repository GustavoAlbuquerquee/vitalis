package br.pucminas.vitalis.consultas.model;

import br.pucminas.vitalis.comum.model.Atendimento;
import br.pucminas.vitalis.comum.model.Campos;
import br.pucminas.vitalis.comum.model.Transicoes;
import br.pucminas.vitalis.comum.service.TransicaoInvalidaException;
import br.pucminas.vitalis.pacientes.model.Paciente;
import br.pucminas.vitalis.profissionais.model.ProfissionalSaude;
import br.pucminas.vitalis.consultas.service.CondicaoAtendimentoException;
import java.time.LocalDateTime;

public abstract class Consulta extends Atendimento<Paciente, ProfissionalSaude> {
    private final String motivo;
    private StatusConsulta status = StatusConsulta.AGENDADA;

    protected Consulta(Long id, Paciente paciente, ProfissionalSaude profissional,
                       String motivo, LocalDateTime criadoEm) {
        super(id, paciente, profissional, criadoEm);
        this.motivo = Campos.texto(motivo, "Motivo");
    }

    protected final void validarParticipantes() {
        if (!getPaciente().isAtivo() || !getProfissional().isAtivo()) {
            throw new CondicaoAtendimentoException("PARTICIPANTE_INATIVO", "Paciente e profissional devem estar ativos");
        }
    }

    public String getMotivo() { return motivo; }
    public StatusConsulta getStatus() { return status; }
    public void confirmar() { transicionar(StatusConsulta.CONFIRMADA); }
    public void iniciar() { transicionar(StatusConsulta.EM_ATENDIMENTO); }
    public void cancelar() { transicionar(StatusConsulta.CANCELADA); }
    public void registrarNaoComparecimento() { transicionar(StatusConsulta.NAO_COMPARECEU); }

    public void concluir(String observacoes) {
        transicionar(StatusConsulta.CONCLUIDA);
        definirObservacoes(observacoes);
    }

    public final void registrarObservacoes(String observacoes) {
        if (status != StatusConsulta.CONCLUIDA) {
            throw new TransicaoInvalidaException("Observações médicas só podem ser registradas após a conclusão");
        }
        definirObservacoes(observacoes);
    }

    private void transicionar(StatusConsulta destino) {
        status = Transicoes.validar(status, destino);
    }

    @Override public boolean ocupaAgenda() {
        return status != StatusConsulta.CANCELADA && status != StatusConsulta.NAO_COMPARECEU;
    }
    public abstract ModalidadeConsulta getModalidade();
}
