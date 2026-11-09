package br.pucminas.vitalis.profissionais.service;

import br.pucminas.vitalis.comum.service.DadosInvalidosException;
import br.pucminas.vitalis.profissionais.model.Cirurgiao;
import br.pucminas.vitalis.profissionais.model.ProfissionalSaude;

/** Fronteira de leitura para módulos que referenciam profissionais. */
public interface ProfissionalService {

    ProfissionalSaude buscarPorId(Long id);

    default Cirurgiao buscarCirurgiao(Long id) {
        ProfissionalSaude profissional = buscarPorId(id);
        if (!(profissional instanceof Cirurgiao)) {
            throw new DadosInvalidosException("O profissional responsável deve ser um cirurgião",
                    java.util.Collections.singletonList("profissionalId: tipo incompatível"));
        }
        return (Cirurgiao) profissional;
    }
}
