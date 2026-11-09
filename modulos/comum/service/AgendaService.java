package br.pucminas.vitalis.comum.service;

import br.pucminas.vitalis.comum.model.Atendimento;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class AgendaService {
    private final List<FonteAgenda> fontes;

    public AgendaService(List<FonteAgenda> fontes) { this.fontes = new ArrayList<>(fontes); }

    public void validarAusenciaDeConflito(Atendimento<?, ?> novo) {
        validarAusenciaDeConflito(novo, null);
    }

    public void validarAusenciaDeConflito(Atendimento<?, ?> novo, Atendimento<?, ?> atendimentoSubstituido) {
        for (FonteAgenda fonte : fontes) {
            for (Atendimento<?, ?> existente : fonte.buscarAtendimentos(novo.getProfissional().getId())) {
                if (existente != novo && existente != atendimentoSubstituido && existente.ocupaAgenda()
                        && existente.getProfissional().getId().equals(novo.getProfissional().getId())
                        && novo.conflitaCom(existente)) {
                    throw new ConflitoDeHorarioException(novo.getProfissional().getId(), novo.getInicio());
                }
            }
        }
    }
}
