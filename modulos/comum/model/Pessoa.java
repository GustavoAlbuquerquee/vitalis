package br.pucminas.vitalis.comum.model;

public abstract class Pessoa {
    private final Long id;
    private final String nome;
    private final String telefone;
    private final String email;
    private boolean ativo = true;

    protected Pessoa(Long id, String nome, String telefone, String email) {
        Campos.exigir(id != null && id > 0, "Identificador deve ser positivo");
        this.id = id;
        this.nome = Campos.texto(nome, "Nome");
        this.telefone = telefone;
        this.email = email;
    }

    public abstract String getIdentificacaoPrincipal();

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getTelefone() { return telefone; }
    public String getEmail() { return email; }
    public boolean isAtivo() { return ativo; }
    public void desativar() { ativo = false; }
}
