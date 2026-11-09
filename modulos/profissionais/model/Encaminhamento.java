package br.pucminas.vitalis.profissionais.model;

public class Encaminhamento {

    private final Long pacienteId;
    private final Long clinicoGeralId;
    private final Especialidade especialidade;
    private final String motivo;

    public Encaminhamento(Long pacienteId, Long clinicoGeralId,
                          Especialidade especialidade, String motivo) {
        this.pacienteId = pacienteId;
        this.clinicoGeralId = clinicoGeralId;
        this.especialidade = especialidade;
        this.motivo = motivo;
    }

    public Long getPacienteId() {
        return pacienteId;
    }

    public Long getClinicoGeralId() {
        return clinicoGeralId;
    }

    public Especialidade getEspecialidade() {
        return especialidade;
    }

    public String getMotivo() {
        return motivo;
    }
}
