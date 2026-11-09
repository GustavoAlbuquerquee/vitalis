package br.pucminas.vitalis.consultas.dto;

import br.pucminas.vitalis.consultas.model.*;
import br.pucminas.vitalis.profissionais.model.Especialidade;
import java.time.*;

public class ConsultaResponse {
    public final Long id;
    public final Long pacienteId;
    public final Long profissionalId;
    public final ModalidadeConsulta modalidade;
    public final StatusConsulta status;
    public final LocalDate data;
    public final LocalTime horario;
    public final Integer duracaoMinutos;
    public final LocalDateTime criadoEm;
    public final String motivo;
    public final String observacoes;
    public final Especialidade especialidade;

    public ConsultaResponse(Consulta consulta) {
        id = consulta.getId();
        pacienteId = consulta.getPaciente().getId();
        profissionalId = consulta.getProfissional().getId();
        modalidade = consulta.getModalidade();
        status = consulta.getStatus();
        data = consulta.getInicio().toLocalDate();
        horario = consulta.getInicio().toLocalTime();
        duracaoMinutos = consulta instanceof ConsultaAgendada
                ? ((ConsultaAgendada) consulta).getDuracaoMinutos() : null;
        criadoEm = consulta.getCriadoEm();
        motivo = consulta.getMotivo();
        observacoes = consulta.getObservacoes();
        especialidade = consulta instanceof ConsultaEspecializada
                ? ((ConsultaEspecializada) consulta).getEspecialidade() : null;
    }
}
