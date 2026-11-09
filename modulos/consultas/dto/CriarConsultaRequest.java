package br.pucminas.vitalis.consultas.dto;

import br.pucminas.vitalis.consultas.model.ModalidadeConsulta;
import br.pucminas.vitalis.consultas.model.PrioridadeEmergencia;
import br.pucminas.vitalis.profissionais.model.Especialidade;
import javax.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalTime;

public class CriarConsultaRequest {
    @NotNull public ModalidadeConsulta modalidade;
    @NotNull @Positive public Long pacienteId;
    @NotNull @Positive public Long profissionalId;
    @NotBlank @Size(max = 2000) public String motivo;
    public LocalDate data;
    public LocalTime horario;
    @Min(1) @Max(1440) public Integer duracaoMinutos;
    public Especialidade especialidade;
    public PrioridadeEmergencia prioridade;
}
