package br.pucminas.vitalis.pacientes.dto;

import br.pucminas.vitalis.comum.model.UF;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

public class EnderecoDTO {

    @NotBlank(message = "logradouro é obrigatório")
    private String logradouro;

    @NotBlank(message = "número é obrigatório")
    private String numero;

    private String complemento;

    @NotBlank(message = "bairro é obrigatório")
    private String bairro;

    @NotBlank(message = "cidade é obrigatória")
    private String cidade;

    @NotNull(message = "uf é obrigatória")
    private UF uf;

    @NotBlank(message = "cep é obrigatório")
    @Pattern(regexp = "\\d{5}-?\\d{3}", message = "cep deve ter 8 dígitos")
    private String cep;

    public String getLogradouro() { return logradouro; }
    public void setLogradouro(String v) { this.logradouro = v; }
    public String getNumero() { return numero; }
    public void setNumero(String v) { this.numero = v; }
    public String getComplemento() { return complemento; }
    public void setComplemento(String v) { this.complemento = v; }
    public String getBairro() { return bairro; }
    public void setBairro(String v) { this.bairro = v; }
    public String getCidade() { return cidade; }
    public void setCidade(String v) { this.cidade = v; }
    public UF getUf() { return uf; }
    public void setUf(UF v) { this.uf = v; }
    public String getCep() { return cep; }
    public void setCep(String v) { this.cep = v; }
}
