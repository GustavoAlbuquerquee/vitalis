package br.pucminas.vitalis.procedimentos.model;

import br.pucminas.vitalis.comum.model.Atendimento;
import br.pucminas.vitalis.comum.service.TransicaoInvalidaException;
import br.pucminas.vitalis.pacientes.model.Paciente;
import br.pucminas.vitalis.profissionais.model.Cirurgiao;

import java.time.LocalDateTime;

public class ProcedimentoCirurgico extends Atendimento<Paciente, Cirurgiao> {

    private final String descricao;
    private final String tipoCirurgia;
    private final String observacoesPreOperatorias;
    private String observacoesPosOperatorias;
    private final LocalDateTime dataHoraPrevista;
    private LocalDateTime dataHoraEfetiva;
    private StatusProcedimento status;

    public ProcedimentoCirurgico(Long id, Paciente paciente, Cirurgiao cirurgiao,
                                 String descricao, String tipoCirurgia,
                                 String observacoesPreOperatorias,
                                 LocalDateTime dataHoraPrevista) {
        super(id, paciente, cirurgiao, LocalDateTime.now());
        this.descricao = descricao;
        this.tipoCirurgia = tipoCirurgia;
        this.observacoesPreOperatorias = observacoesPreOperatorias;
        this.dataHoraPrevista = dataHoraPrevista;
        this.status = StatusProcedimento.AGENDADO;
        validarCondicoes();
    }

    @Override
    public void validarCondicoes() {
        if (getPaciente().getId() == null || getProfissional().getId() == null || descricao == null
                || descricao.trim().isEmpty() || tipoCirurgia == null
                || tipoCirurgia.trim().isEmpty() || dataHoraPrevista == null) {
            throw new IllegalArgumentException("Paciente, cirurgião, descrição, tipo e data prevista são obrigatórios");
        }
    }

    @Override
    public LocalDateTime getInicio() {
        return dataHoraEfetiva == null ? dataHoraPrevista : dataHoraEfetiva;
    }

    @Override
    public LocalDateTime getFim() { return getInicio().plusHours(1); }

    @Override
    public boolean ocupaAgenda() {
        return status == StatusProcedimento.AGENDADO || status == StatusProcedimento.EM_ANDAMENTO;
    }

    public void iniciar(LocalDateTime dataHoraInicio) {
        validarInicio(dataHoraInicio);
        dataHoraEfetiva = dataHoraInicio;
        status = StatusProcedimento.EM_ANDAMENTO;
    }

    public ProcedimentoCirurgico prepararInicio(LocalDateTime dataHoraInicio) {
        validarInicio(dataHoraInicio);
        ProcedimentoCirurgico candidato = new ProcedimentoCirurgico(getId(), getPaciente(), getProfissional(),
                descricao, tipoCirurgia, observacoesPreOperatorias, dataHoraPrevista);
        candidato.dataHoraEfetiva = dataHoraInicio;
        candidato.status = StatusProcedimento.EM_ANDAMENTO;
        return candidato;
    }

    private void validarInicio(LocalDateTime dataHoraInicio) {
        if (status != StatusProcedimento.AGENDADO) {
            throw new TransicaoInvalidaException("Somente um procedimento agendado pode ser iniciado");
        }
        if (dataHoraInicio == null) {
            throw new IllegalArgumentException("A data e hora efetivas de início são obrigatórias");
        }
    }

    public void concluir(LocalDateTime dataHoraConclusao, String observacoesPosOperatorias) {
        if (status != StatusProcedimento.EM_ANDAMENTO) {
            throw new TransicaoInvalidaException("O procedimento precisa ser iniciado antes de ser concluído");
        }
        if (dataHoraConclusao == null || dataHoraConclusao.isBefore(dataHoraEfetiva)) {
            throw new IllegalArgumentException("A conclusão deve ocorrer após o início efetivo");
        }
        this.observacoesPosOperatorias = observacoesPosOperatorias;
        status = StatusProcedimento.CONCLUIDO;
    }

    public void cancelar() {
        if (status != StatusProcedimento.AGENDADO && status != StatusProcedimento.EM_ANDAMENTO) {
            throw new TransicaoInvalidaException("Somente procedimentos agendados ou em andamento podem ser cancelados");
        }
        status = StatusProcedimento.CANCELADO;
    }

    public Long getPacienteId() { return getPaciente().getId(); }
    public String getDescricao() { return descricao; }
    public String getTipoCirurgia() { return tipoCirurgia; }
    public String getObservacoesPreOperatorias() { return observacoesPreOperatorias; }
    public String getObservacoesPosOperatorias() { return observacoesPosOperatorias; }
    public LocalDateTime getDataHoraPrevista() { return dataHoraPrevista; }
    public LocalDateTime getDataHoraEfetiva() { return dataHoraEfetiva; }
    public Cirurgiao getCirurgiao() { return getProfissional(); }
    public StatusProcedimento getStatus() { return status; }
}
