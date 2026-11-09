package br.pucminas.vitalis.consultas.model;

import br.pucminas.vitalis.comum.model.EstadoTransicionavel;

public enum StatusConsulta implements EstadoTransicionavel<StatusConsulta> {
    AGENDADA, CONFIRMADA, EM_ATENDIMENTO, CONCLUIDA, CANCELADA, NAO_COMPARECEU;

    @Override public boolean permite(StatusConsulta destino) {
        switch (this) {
            case AGENDADA:
                return destino == CONFIRMADA || destino == CANCELADA || destino == NAO_COMPARECEU;
            case CONFIRMADA:
                return destino == EM_ATENDIMENTO || destino == CANCELADA || destino == NAO_COMPARECEU;
            case EM_ATENDIMENTO:
                return destino == CONCLUIDA || destino == CANCELADA;
            default:
                return false;
        }
    }
}
