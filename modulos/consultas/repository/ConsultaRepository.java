package br.pucminas.vitalis.consultas.repository;

import br.pucminas.vitalis.consultas.model.Consulta;
import java.util.List;
import java.util.Optional;

public interface ConsultaRepository {
    Long proximoId();
    void adicionar(Consulta consulta);
    Optional<Consulta> buscarPorId(Long id);
    List<Consulta> listar();
}
