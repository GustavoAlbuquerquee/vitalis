package br.pucminas.vitalis.comum.model;

import java.time.LocalDateTime;

/** Raiz da hierarquia de pessoas do sistema. */
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

    protected Pessoa(Long id, String nome, String telefone, String email) {
        this(nome, telefone, email);
        this.id = id;
    }

    public abstract String getIdentificacaoPrincipal();
    public abstract String getTipo();

    public void desativar() { this.ativo = false; }
    public void reativar() { this.ativo = true; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
    protected void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }
}
