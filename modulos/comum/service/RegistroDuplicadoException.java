package br.pucminas.vitalis.comum.service;

/**
 * Tentativa de cadastrar um identificador que já existe: CPF de paciente,
 * registro profissional, número de quarto.
 *
 * <p>Herda o 409 de {@link RegraDeNegocioException}: o pedido é válido em
 * forma, mas conflita com o estado atual do sistema.
 */
public class RegistroDuplicadoException extends RegraDeNegocioException {

    private final String campo;
    private final String valor;

    public RegistroDuplicadoException(String campo, String valor) {
        super("REGISTRO_DUPLICADO", "Já existe um registro com " + campo + " " + valor);
        this.campo = campo;
        this.valor = valor;
    }

    public String getCampo() {
        return campo;
    }

    public String getValor() {
        return valor;
    }
}
