package br.pucminas.vitalis.procedimentos;

import br.pucminas.vitalis.comum.service.TransicaoInvalidaException;
import br.pucminas.vitalis.comum.service.DadosInvalidosException;
import br.pucminas.vitalis.profissionais.model.Cirurgiao;
import br.pucminas.vitalis.profissionais.dto.ProfissionalRequest;
import br.pucminas.vitalis.profissionais.model.TipoProfissional;
import br.pucminas.vitalis.profissionais.service.ProfissionalService;
import br.pucminas.vitalis.procedimentos.dto.ProcedimentoCirurgicoRequest;
import br.pucminas.vitalis.procedimentos.model.ProcedimentoCirurgico;
import br.pucminas.vitalis.procedimentos.model.StatusProcedimento;
import br.pucminas.vitalis.procedimentos.service.ProcedimentoCirurgicoService;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

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
        assertThrows(TransicaoInvalidaException.class, concluido::cancelar);
    }

    @Test
    void rejeitaResponsavelQueNaoSejaCirurgiao() {
        ProfissionalService profissionais = new ProfissionalService();
        ProfissionalRequest request = new ProfissionalRequest();
        request.setTipo(TipoProfissional.CLINICO_GERAL);
        request.setNome("Clínico de teste");
        request.setRegistroProfissional("CRM-MG 400");
        request.setTelefone("31999999999");
        request.setEmail("clinico@vitalis.med.br");
        Long clinicoId = profissionais.cadastrar(request).getId();
        ProcedimentoCirurgicoService service = new ProcedimentoCirurgicoService(profissionais);
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
        ProcedimentoCirurgico primeiro = new ProcedimentoCirurgico(1L, 42L, cirurgiao,
                "Apendicectomia", "Eletiva", null, previsto);
        ProcedimentoCirurgico sobreposto = new ProcedimentoCirurgico(2L, 44L, cirurgiao,
                "Herniorrafia", "Eletiva", null, previsto.plusMinutes(30));
        Cirurgiao outroCirurgiao = new Cirurgiao(4L, "Dr. Outro", "CRM 124",
                "31999999998", "outro@vitalis.med.br", true, "Ortopedia");
        ProcedimentoCirurgico outroProfissional = new ProcedimentoCirurgico(3L, 45L, outroCirurgiao,
                "Artroscopia", "Eletiva", null, previsto);
        ProcedimentoCirurgico adjacente = new ProcedimentoCirurgico(4L, 46L, cirurgiao,
                "Outro", "Eletiva", null, previsto.plusHours(1));

        assertTrue(primeiro.conflitaCom(sobreposto));
        assertFalse(primeiro.conflitaCom(outroProfissional));
        assertFalse(primeiro.conflitaCom(adjacente));
        primeiro.cancelar();
        assertFalse(primeiro.conflitaCom(sobreposto));
    }

    private ProcedimentoCirurgico procedimento() {
        Cirurgiao cirurgiao = new Cirurgiao(3L, "Dra. Cirurgiã", "CRM 123",
                "31999999999", "cirurgiao@vitalis.med.br", true, "Cirurgia geral");
        return new ProcedimentoCirurgico(1L, 42L, cirurgiao, "Apendicectomia",
                "Eletiva", "Avaliação pré-operatória concluída.",
                LocalDateTime.now().plusDays(2));
    }
}
