package br.pucminas.vitalis.procedimentos.model;

import br.pucminas.vitalis.comum.model.Atendimento;
import br.pucminas.vitalis.comum.service.TransicaoInvalidaException;
import br.pucminas.vitalis.profissionais.model.Cirurgiao;

import java.time.LocalDateTime;

public class ProcedimentoCirurgico extends Atendimento {

    private Long id;
    private final String descricao;
    private final String tipoCirurgia;
    private final String observacoesPreOperatorias;
    private String observacoesPosOperatorias;
    private final LocalDateTime dataHoraPrevista;
    private LocalDateTime dataHoraEfetiva;
    private final Cirurgiao cirurgiao;
    private StatusProcedimento status;

    public ProcedimentoCirurgico(Long id, Long pacienteId, Cirurgiao cirurgiao,
                                 String descricao, String tipoCirurgia,
                                 String observacoesPreOperatorias,
                                 LocalDateTime dataHoraPrevista) {
        super(pacienteId, cirurgiao == null ? null : cirurgiao.getId(), null);
        this.id = id;
        this.cirurgiao = cirurgiao;
        this.descricao = descricao;
        this.tipoCirurgia = tipoCirurgia;
        this.observacoesPreOperatorias = observacoesPreOperatorias;
        this.dataHoraPrevista = dataHoraPrevista;
        this.status = StatusProcedimento.AGENDADO;
        validarCondicoes();
    }

    @Override
    public void validarCondicoes() {
        if (getPacienteId() == null || cirurgiao == null || descricao == null
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
    public LocalDateTime getFim() {
        return getInicio().plusHours(1);
    }

    public void iniciar(LocalDateTime dataHoraInicio) {
        if (status != StatusProcedimento.AGENDADO) {
            throw new TransicaoInvalidaException("Somente um procedimento agendado pode ser iniciado");
        }
        if (dataHoraInicio == null) {
            throw new IllegalArgumentException("A data e hora efetivas de início são obrigatórias");
        }
        dataHoraEfetiva = dataHoraInicio;
        status = StatusProcedimento.EM_ANDAMENTO;
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

    public Long getId() {
        return id;
    }

    public String getDescricao() {
        return descricao;
    }

    public String getTipoCirurgia() {
        return tipoCirurgia;
    }

    public String getObservacoesPreOperatorias() {
        return observacoesPreOperatorias;
    }

    public String getObservacoesPosOperatorias() {
        return observacoesPosOperatorias;
    }

    public LocalDateTime getDataHoraPrevista() {
        return dataHoraPrevista;
    }

    public LocalDateTime getDataHoraEfetiva() {
        return dataHoraEfetiva;
    }

    public Cirurgiao getCirurgiao() {
        return cirurgiao;
    }

    public StatusProcedimento getStatus() {
        return status;
    }

    @Override
    public boolean estaAtivo() {
        return status == StatusProcedimento.AGENDADO || status == StatusProcedimento.EM_ANDAMENTO;
    }
}
