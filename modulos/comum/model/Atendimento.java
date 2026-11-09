package br.pucminas.vitalis.comum.model;

import java.time.LocalDateTime;

/** Os parâmetros preservam os tipos concretos sem criar dependências entre módulos. */
public abstract class Atendimento<P extends Pessoa, R extends Pessoa> {
    private final Long id;
    private final P paciente;
    private final R profissional;
    private final LocalDateTime criadoEm;
    private String observacoes;

    protected Atendimento(Long id, P paciente, R profissional, LocalDateTime criadoEm) {
        Campos.exigir(id != null && id > 0, "Identificador deve ser positivo");
        Campos.exigir(paciente != null && profissional != null,
                "Paciente e profissional são obrigatórios");
        Campos.exigir(criadoEm != null, "Momento de criação é obrigatório");
        this.id = id;
        this.paciente = paciente;
        this.profissional = profissional;
        this.criadoEm = criadoEm;
    }

    public abstract LocalDateTime getInicio();
    public abstract LocalDateTime getFim();
    public abstract void validarCondicoes();

    public final boolean conflitaCom(Atendimento<?, ?> outro) {
        Campos.exigir(outro != null, "Atendimento para comparação é obrigatório");
        return getInicio().isBefore(outro.getFim()) && outro.getInicio().isBefore(getFim());
    }

    public boolean ocupaAgenda() { return true; }
    public Long getId() { return id; }
    public P getPaciente() { return paciente; }
    public R getProfissional() { return profissional; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
    public String getObservacoes() { return observacoes; }
    protected final void definirObservacoes(String observacoes) { this.observacoes = observacoes; }
}
