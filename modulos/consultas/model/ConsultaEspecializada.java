package br.pucminas.vitalis.consultas.model;

import br.pucminas.vitalis.comum.model.Campos;
import br.pucminas.vitalis.comum.service.AgendaService;
import br.pucminas.vitalis.consultas.service.CondicaoAtendimentoException;
import br.pucminas.vitalis.pacientes.model.Paciente;
import br.pucminas.vitalis.profissionais.model.Especialidade;
import br.pucminas.vitalis.profissionais.model.ProfissionalSaude;
import java.time.LocalDateTime;

public class ConsultaEspecializada extends ConsultaAgendada {
    private final Especialidade especialidade;

    public ConsultaEspecializada(Long id, Paciente paciente, ProfissionalSaude profissional,
                                 LocalDateTime inicio, int duracao, String motivo,
                                 LocalDateTime criadoEm, AgendaService agenda, Especialidade especialidade) {
        super(id, paciente, profissional, inicio, duracao, motivo, criadoEm, agenda);
        Campos.exigir(especialidade != null, "Especialidade é obrigatória");
        this.especialidade = especialidade;
    }

    @Override public void validarCondicoes() {
        validarAgenda();
        if (getProfissional().getEspecialidade() != especialidade) {
            throw new CondicaoAtendimentoException("ESPECIALIDADE_INCOMPATIVEL",
                    "A área de atuação do profissional é incompatível com a consulta");
        }
    }

    public Especialidade getEspecialidade() { return especialidade; }
    @Override public ModalidadeConsulta getModalidade() { return ModalidadeConsulta.ESPECIALIZADA; }
}
