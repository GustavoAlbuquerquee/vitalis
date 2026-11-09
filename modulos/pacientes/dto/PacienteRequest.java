package br.pucminas.vitalis.pacientes.dto;

import javax.validation.Valid;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Past;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.time.LocalDate;

/**
 * Contrato de entrada. Valida <b>formato</b> — se o campo veio, se tem a cara
 * certa. Se a operação é permitida é decisão da camada de serviço.
 */
public class PacienteRequest {

    @NotBlank(message = "nome é obrigatório")
    @Size(max = 120, message = "nome deve ter no máximo 120 caracteres")
    private String nome;

    @NotBlank(message = "cpf é obrigatório")
    @Pattern(regexp = "\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}", message = "cpf deve ter 11 dígitos")
    private String cpf;

    @NotNull(message = "dataNascimento é obrigatória")
    @Past(message = "dataNascimento não pode ser hoje nem no futuro")
    private LocalDate dataNascimento;

    @NotBlank(message = "telefone é obrigatório")
    @Size(max = 20, message = "telefone deve ter no máximo 20 caracteres")
    private String telefone;

    @NotBlank(message = "email é obrigatório")
    @Email(message = "email inválido")
    private String email;

    @NotNull(message = "endereco é obrigatório")
    @Valid
    private EnderecoDTO endereco;

    public String getNome() { return nome; }
    public void setNome(String v) { this.nome = v; }
    public String getCpf() { return cpf; }
    public void setCpf(String v) { this.cpf = v; }
    public LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(LocalDate v) { this.dataNascimento = v; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String v) { this.telefone = v; }
    public String getEmail() { return email; }
    public void setEmail(String v) { this.email = v; }
    public EnderecoDTO getEndereco() { return endereco; }
    public void setEndereco(EnderecoDTO v) { this.endereco = v; }
}
