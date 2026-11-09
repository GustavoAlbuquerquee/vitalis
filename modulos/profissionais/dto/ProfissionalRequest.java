package br.pucminas.vitalis.profissionais.dto;

import br.pucminas.vitalis.profissionais.model.Especialidade;
import br.pucminas.vitalis.profissionais.model.TipoProfissional;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class ProfissionalRequest {

    @NotNull
    private TipoProfissional tipo;
    @NotBlank
    private String nome;
    @NotBlank
    private String registroProfissional;
    @NotBlank
    private String telefone;
    @NotBlank
    @Email
    private String email;
    private boolean ativo = true;
    private Especialidade especialidade;
    private String areaCirurgica;

    public TipoProfissional getTipo() {
        return tipo;
    }

    public void setTipo(TipoProfissional tipo) {
        this.tipo = tipo;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getRegistroProfissional() {
        return registroProfissional;
    }

    public void setRegistroProfissional(String registroProfissional) {
        this.registroProfissional = registroProfissional;
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

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }

    public Especialidade getEspecialidade() {
        return especialidade;
    }

    public void setEspecialidade(Especialidade especialidade) {
        this.especialidade = especialidade;
    }

    public String getAreaCirurgica() {
        return areaCirurgica;
    }

    public void setAreaCirurgica(String areaCirurgica) {
        this.areaCirurgica = areaCirurgica;
    }
}
