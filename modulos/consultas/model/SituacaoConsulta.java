package br.pucminas.vitalis.consultas.model;

/** Projeção tipada para API/filtros; AGUARDANDO não é um sétimo estado de StatusConsulta. */
public enum SituacaoConsulta {
    AGENDADA, CONFIRMADA, EM_ATENDIMENTO, CONCLUIDA, CANCELADA, NAO_COMPARECEU, AGUARDANDO;

    public static SituacaoConsulta de(Consulta consulta) {
        if (consulta instanceof AtendimentoEmergencia && consulta.getStatus() == StatusConsulta.CONFIRMADA) {
            return AGUARDANDO;
        }
        return valueOf(consulta.getStatus().name());
    }
}
