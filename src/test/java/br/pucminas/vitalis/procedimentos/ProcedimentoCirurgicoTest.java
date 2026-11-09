package br.pucminas.vitalis.procedimentos;

import br.pucminas.vitalis.comum.service.TransicaoInvalidaException;
import br.pucminas.vitalis.comum.service.DadosInvalidosException;
import br.pucminas.vitalis.comum.service.AgendaService;
import br.pucminas.vitalis.comum.service.ConflitoDeHorarioException;
import br.pucminas.vitalis.pacientes.model.Paciente;
import br.pucminas.vitalis.pacientes.service.PacienteAtendimentoService;
import br.pucminas.vitalis.profissionais.model.Cirurgiao;
import br.pucminas.vitalis.profissionais.dto.ProfissionalRequest;
import br.pucminas.vitalis.profissionais.model.TipoProfissional;
import br.pucminas.vitalis.profissionais.service.ProfissionalCadastroService;
import br.pucminas.vitalis.procedimentos.dto.ProcedimentoCirurgicoRequest;
import br.pucminas.vitalis.procedimentos.model.ProcedimentoCirurgico;
import br.pucminas.vitalis.procedimentos.model.StatusProcedimento;
import br.pucminas.vitalis.procedimentos.repository.ProcedimentoRepositoryMemoria;
import br.pucminas.vitalis.procedimentos.service.ProcedimentoCirurgicoService;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ProcedimentoCirurgicoTest {

    @Test
    void naoPermiteConcluirProcedimentoQueAindaNaoFoiIniciado() {
        ProcedimentoCirurgico procedimento = procedimento();

        assertThrows(TransicaoInvalidaException.class,
                () -> procedimento.concluir(LocalDateTime.now(), "Pós-operatório estável"));
        assertEquals(StatusProcedimento.AGENDADO, procedimento.getStatus());
        assertNull(procedimento.getDataHoraEfetiva());
    }

    @Test
    void permiteCancelarAgendadoOuEmAndamentoMasNaoConcluido() {
        ProcedimentoCirurgico agendado = procedimento();
        agendado.cancelar();
        assertEquals(StatusProcedimento.CANCELADO, agendado.getStatus());

        ProcedimentoCirurgico emAndamento = procedimento();
        emAndamento.iniciar(LocalDateTime.now());
        assertNotNull(emAndamento.getDataHoraEfetiva());
        emAndamento.cancelar();
        assertEquals(StatusProcedimento.CANCELADO, emAndamento.getStatus());

        ProcedimentoCirurgico concluido = procedimento();
        LocalDateTime inicio = LocalDateTime.now();
        concluido.iniciar(inicio);
        concluido.concluir(inicio.plusHours(1), "Sem intercorrências");
        assertEquals(StatusProcedimento.CONCLUIDO, concluido.getStatus());
        assertEquals(inicio.plusHours(1), concluido.getDataHoraConclusao());
        assertThrows(TransicaoInvalidaException.class, concluido::cancelar);
    }

    @Test
    void rejeitaResponsavelQueNaoSejaCirurgiao() {
        ProfissionalCadastroService profissionais = new ProfissionalCadastroService();
        ProfissionalRequest request = new ProfissionalRequest();
        request.setTipo(TipoProfissional.CLINICO_GERAL);
        request.setNome("Clínico de teste");
        request.setRegistroProfissional("CRM-MG 400");
        request.setTelefone("31999999999");
        request.setEmail("clinico@vitalis.med.br");
        Long clinicoId = profissionais.cadastrar(request).getId();
        PacienteAtendimentoService pacientes = id -> paciente(id);
        ProcedimentoRepositoryMemoria repository = new ProcedimentoRepositoryMemoria();
        AgendaService agenda = new AgendaService(Collections.singletonList(repository));
        ProcedimentoCirurgicoService service = new ProcedimentoCirurgicoService(
                repository, profissionais, pacientes, agenda);
        ProcedimentoCirurgicoRequest procedimento = new ProcedimentoCirurgicoRequest();
        procedimento.setPacienteId(10L);
        procedimento.setCirurgiaoId(clinicoId);
        procedimento.setDescricao("Apendicectomia");
        procedimento.setTipoCirurgia("Eletiva");
        procedimento.setDataHoraPrevista(LocalDateTime.now().plusDays(1));

        assertThrows(DadosInvalidosException.class, () -> service.cadastrar(procedimento));
    }

    @Test
    void atendimentoComparaConflitosApenasParaResponsavelEIntervaloAtivos() {
        Cirurgiao cirurgiao = new Cirurgiao(3L, "Dra. Cirurgiã", "CRM 123",
                "31999999999", "cirurgiao@vitalis.med.br", true, "Cirurgia geral");
        LocalDateTime previsto = LocalDateTime.now().plusDays(2);
        ProcedimentoCirurgico primeiro = new ProcedimentoCirurgico(1L, paciente(42L), cirurgiao,
                "Apendicectomia", "Eletiva", null, previsto);
        ProcedimentoCirurgico sobreposto = new ProcedimentoCirurgico(2L, paciente(44L), cirurgiao,
                "Herniorrafia", "Eletiva", null, previsto.plusMinutes(30));
        Cirurgiao outroCirurgiao = new Cirurgiao(4L, "Dr. Outro", "CRM 124",
                "31999999998", "outro@vitalis.med.br", true, "Ortopedia");
        ProcedimentoCirurgico outroProfissional = new ProcedimentoCirurgico(3L, paciente(45L), outroCirurgiao,
                "Artroscopia", "Eletiva", null, previsto);
        ProcedimentoCirurgico adjacente = new ProcedimentoCirurgico(4L, paciente(46L), cirurgiao,
                "Outro", "Eletiva", null, previsto.plusHours(1));

        assertTrue(primeiro.conflitaCom(sobreposto));
        assertFalse(primeiro.conflitaCom(outroProfissional));
        assertFalse(primeiro.conflitaCom(adjacente));
        primeiro.cancelar();
        assertFalse(primeiro.conflitaCom(sobreposto));
    }

    @Test
    void naoPermiteAgendarOuIniciarEmConflitoComOutroProcedimento() {
        ProfissionalCadastroService profissionais = new ProfissionalCadastroService();
        ProfissionalRequest requestCirurgiao = new ProfissionalRequest();
        requestCirurgiao.setTipo(TipoProfissional.CIRURGIAO);
        requestCirurgiao.setNome("Cirurgião de teste");
        requestCirurgiao.setRegistroProfissional("CRM-MG 900");
        requestCirurgiao.setTelefone("31999999999");
        requestCirurgiao.setEmail("cirurgiao@vitalis.med.br");
        requestCirurgiao.setAreaCirurgica("Cirurgia geral");
        Long cirurgiaoId = profissionais.cadastrar(requestCirurgiao).getId();

        PacienteAtendimentoService pacientes = id -> paciente(id);
        ProcedimentoRepositoryMemoria repository = new ProcedimentoRepositoryMemoria();
        AgendaService agenda = new AgendaService(Collections.singletonList(repository));
        ProcedimentoCirurgicoService service = new ProcedimentoCirurgicoService(
                repository, profissionais, pacientes, agenda);
        LocalDateTime inicio = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0).withNano(0);

        ProcedimentoCirurgico primeiro = service.cadastrar(procedimentoRequest(1L, cirurgiaoId, inicio));
        ProcedimentoCirurgico segundo = service.cadastrar(procedimentoRequest(2L, cirurgiaoId, inicio.plusHours(1)));
        assertThrows(ConflitoDeHorarioException.class,
                () -> service.cadastrar(procedimentoRequest(3L, cirurgiaoId, inicio.plusMinutes(30))));

        assertThrows(ConflitoDeHorarioException.class,
                () -> service.iniciar(segundo.getId(), inicio.plusMinutes(30)));
        assertEquals(StatusProcedimento.AGENDADO, segundo.getStatus());
        assertNull(segundo.getDataHoraEfetiva());
        assertEquals(StatusProcedimento.AGENDADO, primeiro.getStatus());
    }

    private ProcedimentoCirurgico procedimento() {
        Cirurgiao cirurgiao = new Cirurgiao(3L, "Dra. Cirurgiã", "CRM 123",
                "31999999999", "cirurgiao@vitalis.med.br", true, "Cirurgia geral");
        return new ProcedimentoCirurgico(1L, paciente(42L), cirurgiao, "Apendicectomia",
                "Eletiva", "Avaliação pré-operatória concluída.",
                LocalDateTime.now().plusDays(2));
    }

    private Paciente paciente(Long id) {
        return new Paciente(id, "Paciente de teste", "31999999999", "paciente@vitalis.med.br", "52998224725");
    }

    private ProcedimentoCirurgicoRequest procedimentoRequest(Long pacienteId, Long cirurgiaoId,
                                                              LocalDateTime inicio) {
        ProcedimentoCirurgicoRequest request = new ProcedimentoCirurgicoRequest();
        request.setPacienteId(pacienteId);
        request.setCirurgiaoId(cirurgiaoId);
        request.setDescricao("Procedimento de teste");
        request.setTipoCirurgia("Eletiva");
        request.setDataHoraPrevista(inicio);
        return request;
    }
}
