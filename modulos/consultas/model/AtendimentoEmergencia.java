package br.pucminas.vitalis.consultas.model;

import br.pucminas.vitalis.pacientes.model.Paciente;
import br.pucminas.vitalis.profissionais.model.ProfissionalSaude;
import java.time.LocalDateTime;

public class AtendimentoEmergencia extends Consulta {
    public AtendimentoEmergencia(Long id, Paciente paciente, ProfissionalSaude profissional,
                                 String motivo, LocalDateTime chegada) {
        super(id, paciente, profissional, motivo, chegada);
    }

    @Override public void validarCondicoes() { validarParticipantes(); }
    @Override public LocalDateTime getInicio() { return getCriadoEm(); }
    @Override public LocalDateTime getFim() { return getCriadoEm(); }
    @Override public boolean ocupaAgenda() { return false; }
    @Override public ModalidadeConsulta getModalidade() { return ModalidadeConsulta.EMERGENCIA; }
}
