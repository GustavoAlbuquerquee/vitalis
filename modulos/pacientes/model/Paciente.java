package br.pucminas.vitalis.pacientes.model;

import br.pucminas.vitalis.comum.model.Endereco;
import br.pucminas.vitalis.comum.model.Pessoa;

import java.time.LocalDate;
import java.time.Period;

/**
 * Quem é atendido pelo hospital.
 *
 * <p>É a entidade central do produto: nenhuma consulta e nenhuma internação
 * existem sem um paciente cadastrado (RN1).
 */
public class Paciente extends Pessoa {

    private String cpf;
    private LocalDate dataNascimento;
    private Endereco endereco;

    protected Paciente() {
        super();
    }

    public Paciente(String nome, String cpf, LocalDate dataNascimento,
                    String telefone, String email, Endereco endereco) {
        super(nome, telefone, email);
        this.cpf = somenteDigitos(cpf);
        this.dataNascimento = dataNascimento;
        this.endereco = endereco;
    }

    /**
     * O CPF é o que identifica o paciente no mundo real — é o que a
     * superclasse pede em {@code getIdentificacaoPrincipal()}.
     */
    @Override
    public String getIdentificacaoPrincipal() {
        return cpf;
    }

    @Override
    public String getTipo() {
        return "PACIENTE";
    }

    /** Idade em anos completos, calculada a partir de hoje. */
    public int getIdade() {
        if (dataNascimento == null) {
            return 0;
        }
        return Period.between(dataNascimento, LocalDate.now()).getYears();
    }

    /**
     * Data de nascimento no futuro é dado impossível, não preferência.
     * Fica no modelo para valer mesmo que o controller esqueça de checar.
     */
    public boolean temDataNascimentoValida() {
        return dataNascimento != null && !dataNascimento.isAfter(LocalDate.now());
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = somenteDigitos(cpf);
    }

    /** "529.982.247-25" para exibição; o armazenado é só dígito. */
    public String getCpfFormatado() {
        if (cpf == null || cpf.length() != 11) {
            return cpf;
        }
        return cpf.substring(0, 3) + "." + cpf.substring(3, 6) + "."
                + cpf.substring(6, 9) + "-" + cpf.substring(9);
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public Endereco getEndereco() {
        return endereco;
    }

    public void setEndereco(Endereco endereco) {
        this.endereco = endereco;
    }

    private static String somenteDigitos(String valor) {
        return valor == null ? null : valor.replaceAll("\\D", "");
    }
}
