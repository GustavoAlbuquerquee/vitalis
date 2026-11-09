package br.pucminas.vitalis.pacientes.dto;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Página de resultados.
 *
 * <p>Escrita à mão porque o projeto ainda não tem Spring Data — a decisão de
 * persistência está em aberto (ADR 0002). Quando houver, troca-se por
 * {@code Page<T>} e o formato da resposta não muda.
 */
public final class PaginaResponse<T> {

    private final List<T> conteudo;
    private final int pagina;
    private final int tamanho;
    private final long totalDeItens;
    private final int totalDePaginas;

    private PaginaResponse(List<T> conteudo, int pagina, int tamanho, long totalDeItens) {
        this.conteudo = Collections.unmodifiableList(new ArrayList<>(conteudo));
        this.pagina = pagina;
        this.tamanho = tamanho;
        this.totalDeItens = totalDeItens;
        this.totalDePaginas = tamanho <= 0 ? 0 : (int) Math.ceil((double) totalDeItens / tamanho);
    }

    /** Recorta a lista completa na página pedida. */
    public static <T> PaginaResponse<T> de(List<T> todos, int pagina, int tamanho) {
        int p = Math.max(pagina, 0);
        int t = tamanho <= 0 ? 20 : Math.min(tamanho, 100);
        int inicio = Math.min(p * t, todos.size());
        int fim = Math.min(inicio + t, todos.size());
        return new PaginaResponse<>(todos.subList(inicio, fim), p, t, todos.size());
    }

    public List<T> getConteudo() { return conteudo; }
    public int getPagina() { return pagina; }
    public int getTamanho() { return tamanho; }
    public long getTotalDeItens() { return totalDeItens; }
    public int getTotalDePaginas() { return totalDePaginas; }
}
