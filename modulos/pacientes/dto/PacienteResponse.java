package br.pucminas.vitalis.pacientes.dto;

import br.pucminas.vitalis.comum.model.Endereco;
import br.pucminas.vitalis.pacientes.model.Paciente;

import java.time.LocalDate;

/**
 * Contrato de saída. Existe para a API não ficar amarrada ao formato interno
 * do modelo: renomear um campo de {@link Paciente} não quebra quem consome.
 */
public final class PacienteResponse {

    private final Long id;
    private final String nome;
    private final String cpf;
    private final LocalDate dataNascimento;
    private final int idade;
    private final String telefone;
    private final String email;
    private final String endereco;
    private final boolean ativo;

    private PacienteResponse(Paciente p) {
        this.id = p.getId();
        this.nome = p.getNome();
        this.cpf = p.getCpfFormatado();
        this.dataNascimento = p.getDataNascimento();
        this.idade = p.getIdade();
        this.telefone = p.getTelefone();
        this.email = p.getEmail();
        Endereco e = p.getEndereco();
        this.endereco = e == null ? null : e.getEnderecoFormatado();
        this.ativo = p.isAtivo();
    }

    public static PacienteResponse de(Paciente paciente) {
        return new PacienteResponse(paciente);
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getCpf() { return cpf; }
    public LocalDate getDataNascimento() { return dataNascimento; }
    public int getIdade() { return idade; }
    public String getTelefone() { return telefone; }
    public String getEmail() { return email; }
    public String getEndereco() { return endereco; }
    public boolean isAtivo() { return ativo; }
}
