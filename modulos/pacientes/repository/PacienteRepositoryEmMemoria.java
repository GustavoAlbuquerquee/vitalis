package br.pucminas.vitalis.pacientes.repository;

import br.pucminas.vitalis.pacientes.model.Paciente;
import org.springframework.stereotype.Repository;

import java.text.Collator;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/** Implementação em memória. Será substituída por JPA na Sprint 3. */
@Repository
public class PacienteRepositoryEmMemoria implements PacienteRepository {

    private final Map<Long, Paciente> porId = new ConcurrentHashMap<>();
    private final AtomicLong sequencia = new AtomicLong(0);
    private final Collator collator = Collator.getInstance(new Locale("pt", "BR"));

    @Override
    public Paciente salvar(Paciente paciente) {
        if (paciente.getId() == null) {
            paciente.setId(sequencia.incrementAndGet());
        }
        porId.put(paciente.getId(), paciente);
        return paciente;
    }

    @Override
    public Optional<Paciente> buscarPorId(Long id) {
        return Optional.ofNullable(porId.get(id));
    }

    @Override
    public Optional<Paciente> buscarPorCpf(String cpf) {
        String alvo = digitos(cpf);
        if (alvo == null) {
            return Optional.empty();
        }
        for (Paciente p : porId.values()) {
            if (alvo.equals(p.getCpf())) {
                return Optional.of(p);
            }
        }
        return Optional.empty();
    }

    @Override
    public boolean existePorCpf(String cpf) {
        return buscarPorCpf(cpf).isPresent();
    }

    @Override
    public List<Paciente> listar(String nome, String cpf) {
        String porNome = normalizar(nome);
        String porCpf = digitos(cpf);
        List<Paciente> encontrados = new ArrayList<>();
        for (Paciente p : porId.values()) {
            if (!p.isAtivo()) {
                continue;
            }
            if (porNome != null && !normalizar(p.getNome()).contains(porNome)) {
                continue;
            }
            if (porCpf != null && (p.getCpf() == null || !p.getCpf().contains(porCpf))) {
                continue;
            }
            encontrados.add(p);
        }
        encontrados.sort(Comparator.comparing(Paciente::getNome, collator));
        return encontrados;
    }

    @Override
    public void remover(Long id) {
        porId.remove(id);
    }

    /** Busca por nome ignora acento e caixa: "jose" encontra "José". */
    private static String normalizar(String valor) {
        if (valor == null || valor.trim().isEmpty()) {
            return null;
        }
        String semAcento = Normalizer.normalize(valor.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return semAcento.toLowerCase(new Locale("pt", "BR"));
    }

    private static String digitos(String valor) {
        if (valor == null) {
            return null;
        }
        String so = valor.replaceAll("\\D", "");
        return so.isEmpty() ? null : so;
    }
}
