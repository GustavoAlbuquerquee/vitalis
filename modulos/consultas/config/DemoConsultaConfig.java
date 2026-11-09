package br.pucminas.vitalis.consultas.config;

import br.pucminas.vitalis.comum.service.RecursoNaoEncontradoException;
import br.pucminas.vitalis.pacientes.model.Paciente;
import br.pucminas.vitalis.pacientes.service.PacienteAtendimentoService;
import br.pucminas.vitalis.profissionais.dto.DisponibilidadeRequest;
import br.pucminas.vitalis.profissionais.dto.ProfissionalRequest;
import br.pucminas.vitalis.profissionais.model.DiaSemana;
import br.pucminas.vitalis.profissionais.model.Especialidade;
import br.pucminas.vitalis.profissionais.model.TipoProfissional;
import br.pucminas.vitalis.profissionais.service.ProfissionalCadastroService;
import br.pucminas.vitalis.profissionais.service.ProfissionalService;
import org.springframework.context.annotation.*;
import java.time.LocalTime;

@Configuration @Profile("demo")
public class DemoConsultaConfig {
    @Bean public PacienteAtendimentoService pacientesDemo() {
        Paciente paciente = new Paciente(1L, "Paciente demonstração", null, null, "00000000000");
        return id -> {
            if (!paciente.getId().equals(id)) throw new RecursoNaoEncontradoException("Paciente", id);
            return paciente;
        };
    }

    @Bean @Primary public ProfissionalService profissionaisDemo(ProfissionalCadastroService cadastro) {
        ProfissionalRequest request = new ProfissionalRequest();
        request.setTipo(TipoProfissional.ESPECIALISTA);
        request.setNome("Médico demonstração");
        request.setRegistroProfissional("DEMO-1");
        request.setTelefone("31999999999");
        request.setEmail("demo@vitalis.med.br");
        request.setEspecialidade(Especialidade.CARDIOLOGIA);
        Long profissionalId = cadastro.cadastrar(request).getId();
        for (DiaSemana dia : DiaSemana.values()) {
            DisponibilidadeRequest janela = new DisponibilidadeRequest();
            janela.setDiaSemana(dia);
            janela.setHoraInicio(LocalTime.of(8, 0));
            janela.setHoraFim(LocalTime.of(18, 0));
            cadastro.adicionarDisponibilidade(profissionalId, janela);
        }
        return cadastro;
    }
}
