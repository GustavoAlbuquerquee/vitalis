package br.pucminas.vitalis.internacoes.model;

import br.pucminas.vitalis.comum.model.Atendimento;
import br.pucminas.vitalis.comum.service.AltaInvalidaException;
import br.pucminas.vitalis.comum.service.TransicaoInvalidaException;
import br.pucminas.vitalis.pacientes.model.Paciente;
import br.pucminas.vitalis.profissionais.model.ProfissionalSaude;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class Internacao extends Atendimento<Paciente, ProfissionalSaude> {

    private Long quartoId;
    private final LocalDateTime dataEntrada;
    private final LocalDate dataPrevistaAlta;
    private LocalDateTime dataEfetivaAlta;
    private final String motivo;
    private StatusInternacao status;

    public Internacao(Long id, Paciente paciente, ProfissionalSaude profissional, Long quartoId,
                      LocalDateTime dataEntrada, LocalDate dataPrevistaAlta,
                      String motivo, String observacoes) {
        super(id, paciente, profissional, LocalDateTime.now());
        this.quartoId = quartoId;
        this.dataEntrada = dataEntrada;
        this.dataPrevistaAlta = dataPrevistaAlta;
        this.motivo = motivo;
        this.status = StatusInternacao.ATIVA;
        definirObservacoes(observacoes);
        validarCondicoes();
    }

    @Override
    public void validarCondicoes() {
        if (getPaciente().getId() == null || getProfissional().getId() == null || quartoId == null
                || dataEntrada == null || dataPrevistaAlta == null
                || motivo == null || motivo.trim().isEmpty()) {
            throw new IllegalArgumentException("Paciente, profissional, quarto, datas e motivo são obrigatórios");
        }
    }

    @Override
    public LocalDateTime getInicio() { return dataEntrada; }

    @Override
    public LocalDateTime getFim() {
        return dataEfetivaAlta == null ? LocalDateTime.MAX : dataEfetivaAlta;
    }

    @Override
    public boolean ocupaAgenda() { return false; }

    public void registrarAlta(LocalDateTime dataEfetivaAlta) {
        if (status != StatusInternacao.ATIVA) {
            throw new TransicaoInvalidaException("Somente uma internação ativa pode receber alta");
        }
        if (dataEfetivaAlta == null || dataEfetivaAlta.isBefore(dataEntrada)) {
            throw new AltaInvalidaException("A data efetiva de alta não pode anteceder a entrada");
        }
        this.dataEfetivaAlta = dataEfetivaAlta;
        this.status = StatusInternacao.ALTA_CONCEDIDA;
    }

    public void registrarTransferencia(LocalDateTime dataTransferencia) {
        if (status != StatusInternacao.ATIVA) {
            throw new TransicaoInvalidaException("Somente uma internação ativa pode ser transferida");
        }
        if (dataTransferencia == null || dataTransferencia.isBefore(dataEntrada)) {
            throw new IllegalArgumentException("A data da transferência não pode anteceder a entrada");
        }
        dataEfetivaAlta = dataTransferencia;
        status = StatusInternacao.TRANSFERIDA;
    }

    public Long getPacienteId() { return getPaciente().getId(); }
    public Long getProfissionalId() { return getProfissional().getId(); }
    public Long getQuartoId() { return quartoId; }
    public void setQuartoId(Long quartoId) { this.quartoId = quartoId; }
    public LocalDateTime getDataEntrada() { return dataEntrada; }
    public LocalDate getDataPrevistaAlta() { return dataPrevistaAlta; }
    public LocalDateTime getDataEfetivaAlta() { return dataEfetivaAlta; }
    public String getMotivo() { return motivo; }
    public StatusInternacao getStatus() { return status; }
}
