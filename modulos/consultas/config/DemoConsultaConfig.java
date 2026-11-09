package br.pucminas.vitalis.consultas.config;

import br.pucminas.vitalis.comum.service.RecursoNaoEncontradoException;
import br.pucminas.vitalis.pacientes.model.Paciente;
import br.pucminas.vitalis.pacientes.service.PacienteAtendimentoService;
import br.pucminas.vitalis.profissionais.model.*;
import br.pucminas.vitalis.profissionais.service.ProfissionalService;
import org.springframework.context.annotation.*;
import java.time.*;
import java.util.*;

@Configuration @Profile("demo")
public class DemoConsultaConfig {
    @Bean public PacienteAtendimentoService pacientesDemo() {
        Paciente paciente = new Paciente(1L, "Paciente demonstração", null, null, "00000000000");
        return id -> {
            if (!paciente.getId().equals(id)) throw new RecursoNaoEncontradoException("Paciente", id);
            return paciente;
        };
    }

    @Bean public ProfissionalService profissionaisDemo() {
        List<Disponibilidade> janelas = new ArrayList<>();
        for (DayOfWeek dia : DayOfWeek.values()) {
            janelas.add(new Disponibilidade(dia, LocalTime.of(8, 0), LocalTime.of(18, 0)));
        }
        ProfissionalSaude medico = new Especialista(1L, "Médico demonstração", null, null,
                "DEMO-1", Especialidade.CARDIOLOGIA, janelas);
        return id -> {
            if (!medico.getId().equals(id)) throw new RecursoNaoEncontradoException("Profissional", id);
            return medico;
        };
    }
}
