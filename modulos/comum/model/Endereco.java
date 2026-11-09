package br.pucminas.vitalis.comum.model;

import java.util.Objects;

/**
 * Objeto de valor: não tem identidade própria nem existe sozinho.
 *
 * <p>Dois endereços com os mesmos campos são o mesmo endereço — por isso
 * {@code equals} compara conteúdo e não identidade, e por isso não há
 * {@code id}. Quando houver persistência, vira {@code @Embeddable}.
 */
public final class Endereco {

    private final String logradouro;
    private final String numero;
    private final String complemento;
    private final String bairro;
    private final String cidade;
    private final UF uf;
    private final String cep;

    public Endereco(String logradouro, String numero, String complemento,
                    String bairro, String cidade, UF uf, String cep) {
        this.logradouro = logradouro;
        this.numero = numero;
        this.complemento = complemento;
        this.bairro = bairro;
        this.cidade = cidade;
        this.uf = uf;
        this.cep = cep == null ? null : cep.replaceAll("\\D", "");
    }

    /** "Rua das Acácias, 120 — Vila Nova, Belo Horizonte/MG" */
    public String getEnderecoFormatado() {
        StringBuilder sb = new StringBuilder();
        sb.append(logradouro).append(", ").append(numero);
        if (complemento != null && !complemento.trim().isEmpty()) {
            sb.append(" ").append(complemento);
        }
        sb.append(" — ").append(bairro).append(", ").append(cidade).append("/").append(uf);
        return sb.toString();
    }

    public String getLogradouro() {
        return logradouro;
    }

    public String getNumero() {
        return numero;
    }

    public String getComplemento() {
        return complemento;
    }

    public String getBairro() {
        return bairro;
    }

    public String getCidade() {
        return cidade;
    }

    public UF getUf() {
        return uf;
    }

    public String getCep() {
        return cep;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Endereco)) {
            return false;
        }
        Endereco outro = (Endereco) o;
        return Objects.equals(logradouro, outro.logradouro)
                && Objects.equals(numero, outro.numero)
                && Objects.equals(complemento, outro.complemento)
                && Objects.equals(bairro, outro.bairro)
                && Objects.equals(cidade, outro.cidade)
                && uf == outro.uf
                && Objects.equals(cep, outro.cep);
    }

    @Override
    public int hashCode() {
        return Objects.hash(logradouro, numero, complemento, bairro, cidade, uf, cep);
    }

    @Override
    public String toString() {
        return getEnderecoFormatado();
    }
}
