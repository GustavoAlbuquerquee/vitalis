package br.pucminas.vitalis.quartos.model;

import br.pucminas.vitalis.comum.service.CapacidadeExcedidaException;
import br.pucminas.vitalis.comum.service.QuartoIndisponivelException;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

public class Quarto {

    private Long id;
    private final String numero;
    private final int andar;
    private final int capacidadeMaxima;
    private final TipoQuarto tipo;
    private SituacaoQuarto bloqueio;
    private final Set<Long> internacoesAtivas = new HashSet<>();

    public Quarto(Long id, String numero, int andar, int capacidadeMaxima, TipoQuarto tipo) {
        if (numero == null || numero.trim().isEmpty() || capacidadeMaxima < 1 || tipo == null) {
            throw new IllegalArgumentException("Número, capacidade positiva e tipo são obrigatórios");
        }
        this.id = id;
        this.numero = numero;
        this.andar = andar;
        this.capacidadeMaxima = capacidadeMaxima;
        this.tipo = tipo;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumero() {
        return numero;
    }

    public int getAndar() {
        return andar;
    }

    public int getCapacidadeMaxima() {
        return capacidadeMaxima;
    }

    public TipoQuarto getTipo() {
        return tipo;
    }

    public SituacaoQuarto getBloqueio() {
        return bloqueio;
    }

    public synchronized int getOcupacaoAtual() {
        return internacoesAtivas.size();
    }

    public synchronized int getVagasDisponiveis() {
        return bloqueio == null ? capacidadeMaxima - getOcupacaoAtual() : 0;
    }

    public synchronized SituacaoQuarto getSituacao() {
        if (bloqueio != null) {
            return bloqueio;
        }
        return getOcupacaoAtual() >= capacidadeMaxima
                ? SituacaoQuarto.OCUPADO : SituacaoQuarto.DISPONIVEL;
    }

    @JsonIgnore
    public synchronized Set<Long> getInternacoesAtivas() {
        return Collections.unmodifiableSet(internacoesAtivas);
    }

    public synchronized boolean estaDisponivel() {
        return bloqueio == null && getOcupacaoAtual() < capacidadeMaxima;
    }

    public synchronized void ocupar(Long internacaoId) {
        if (!estaDisponivel()) {
            if (bloqueio != null) {
                throw new QuartoIndisponivelException(numero);
            }
            throw new CapacidadeExcedidaException(numero, capacidadeMaxima);
        }
        if (!internacoesAtivas.add(internacaoId)) {
            throw new IllegalArgumentException("A internação já ocupa este quarto");
        }
    }

    public synchronized void liberar(Long internacaoId) {
        if (!internacoesAtivas.remove(internacaoId)) {
            throw new IllegalArgumentException("A internação não ocupa este quarto");
        }
    }

    public synchronized void definirBloqueio(SituacaoQuarto novoBloqueio) {
        if (novoBloqueio != null && novoBloqueio != SituacaoQuarto.MANUTENCAO
                && novoBloqueio != SituacaoQuarto.INTERDITADO) {
            throw new IllegalArgumentException("O bloqueio deve ser manutenção ou interdição");
        }
        if (novoBloqueio != null && !internacoesAtivas.isEmpty()) {
            throw new QuartoIndisponivelException(numero);
        }
        bloqueio = novoBloqueio;
    }
}
