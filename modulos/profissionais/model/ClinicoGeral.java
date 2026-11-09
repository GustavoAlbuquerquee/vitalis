package br.pucminas.vitalis.profissionais.model;

import java.util.List;

public class ClinicoGeral extends ProfissionalSaude {

    public ClinicoGeral(Long id, String nome, String registroProfissional,
                        String telefone, String email, boolean ativo) {
        super(id, nome, registroProfissional, telefone, email, ativo);
    }

    public ClinicoGeral(Long id, String nome, String telefone, String email,
                        String registro, List<Disponibilidade> disponibilidades) {
        super(id, nome, telefone, email, registro, disponibilidades);
    }

    @Override
    public String getTipo() { return TipoProfissional.CLINICO_GERAL.name(); }

    public Encaminhamento encaminhar(Long pacienteId, Especialidade especialidade, String motivo) {
        if (pacienteId == null || especialidade == null || especialidade == Especialidade.CLINICA_GERAL
                || motivo == null || motivo.trim().isEmpty()) {
            throw new IllegalArgumentException("Encaminhamento exige paciente, especialidade e motivo");
        }
        return new Encaminhamento(pacienteId, getId(), especialidade, motivo);
    }
}
