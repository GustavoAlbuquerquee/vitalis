package br.pucminas.vitalis.comum.model;

import java.time.LocalDateTime;

/**
 * Raiz da hierarquia de pessoas do sistema.
 *
 * <p>Carrega o que paciente e profissional da saúde têm em comum. O que os
 * distingue — CPF de um lado, registro profissional do outro — fica nas
 * subclasses, e {@link #getIdentificacaoPrincipal()} é o que permite tratar
 * os dois de forma uniforme sem saber qual é qual.
 *
 * <p>Ver ADR 0005 e docs/diagrama-de-classes.md.
 */
public abstract class Pessoa {

    private Long id;
    private String nome;
    private String telefone;
    private String email;
    private boolean ativo = true;
    private LocalDateTime criadoEm = LocalDateTime.now();

    protected Pessoa() {
    }

    protected Pessoa(String nome, String telefone, String email) {
        this.nome = nome;
        this.telefone = telefone;
        this.email = email;
    }

    /** Construtor usado por atendimentos que recebem referências do cadastro. */
    protected Pessoa(Long id, String nome, String telefone, String email) {
        this(nome, telefone, email);
        this.id = id;
    }

    /**
     * O identificador que a pessoa usa no mundo real: CPF para o paciente,
     * registro do conselho para o profissional.
     */
    public abstract String getIdentificacaoPrincipal();

    /** Rótulo da categoria, para exibição e filtro. */
    public abstract String getTipo();

    /**
     * Desativação lógica. Nada é removido fisicamente do sistema — é assim
     * que o histórico de atendimentos se mantém (RN6).
     */
    public void desativar() {
        this.ativo = false;
    }

    public void reativar() {
        this.ativo = true;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    protected void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }
}
