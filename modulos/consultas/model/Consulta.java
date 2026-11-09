package br.pucminas.vitalis.consultas.model;

import br.pucminas.vitalis.comum.model.Atendimento;
import br.pucminas.vitalis.comum.model.Campos;
import br.pucminas.vitalis.pacientes.model.Paciente;
import br.pucminas.vitalis.profissionais.model.ProfissionalSaude;
import br.pucminas.vitalis.consultas.service.CondicaoAtendimentoException;
import java.time.LocalDateTime;

public abstract class Consulta extends Atendimento<Paciente, ProfissionalSaude> {
    private final String motivo;

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
    public abstract ModalidadeConsulta getModalidade();
}
