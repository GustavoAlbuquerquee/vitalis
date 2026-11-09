package br.pucminas.vitalis.consultas.model;

import br.pucminas.vitalis.comum.service.AgendaService;
import br.pucminas.vitalis.pacientes.model.Paciente;
import br.pucminas.vitalis.profissionais.model.ProfissionalSaude;
import java.time.LocalDateTime;

public class ConsultaRotina extends ConsultaAgendada {
    public ConsultaRotina(Long id, Paciente paciente, ProfissionalSaude profissional,
                          LocalDateTime inicio, int duracao, String motivo,
                          LocalDateTime criadoEm, AgendaService agenda) {
        super(id, paciente, profissional, inicio, duracao, motivo, criadoEm, agenda);
    }
    @Override public void validarCondicoes() { validarAgenda(); }
    @Override public ModalidadeConsulta getModalidade() { return ModalidadeConsulta.ROTINA; }
}
