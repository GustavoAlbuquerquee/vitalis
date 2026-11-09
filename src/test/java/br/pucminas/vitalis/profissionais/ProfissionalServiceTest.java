package br.pucminas.vitalis.profissionais;

import br.pucminas.vitalis.comum.service.ConflitoDisponibilidadeException;
import br.pucminas.vitalis.comum.service.RegistroProfissionalDuplicadoException;
import br.pucminas.vitalis.profissionais.dto.DisponibilidadeRequest;
import br.pucminas.vitalis.profissionais.dto.EncaminhamentoRequest;
import br.pucminas.vitalis.profissionais.dto.ProfissionalRequest;
import br.pucminas.vitalis.profissionais.model.DiaSemana;
import br.pucminas.vitalis.profissionais.model.Especialidade;
import br.pucminas.vitalis.profissionais.model.Especialista;
import br.pucminas.vitalis.profissionais.model.TipoProfissional;
import br.pucminas.vitalis.profissionais.service.ProfissionalCadastroService;
import org.junit.jupiter.api.Test;

import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ProfissionalServiceTest {

    private final ProfissionalCadastroService service = new ProfissionalCadastroService();

    @Test
    void deveInstanciarCadaCategoriaEFiltrarPorEspecialidade() {
        ProfissionalRequest clinico = profissional(TipoProfissional.CLINICO_GERAL, "CRM-MG 1", null);
        ProfissionalRequest especialista = profissional(TipoProfissional.ESPECIALISTA, "CRM-MG 2",
                Especialidade.CARDIOLOGIA);
        ProfissionalRequest cirurgiao = profissional(TipoProfissional.CIRURGIAO, "CRM-MG 3", null);
        cirurgiao.setAreaCirurgica("Cirurgia geral");

        service.cadastrar(clinico);
        service.cadastrar(especialista);
        service.cadastrar(cirurgiao);

        assertEquals(1, service.listar(Especialidade.CLINICA_GERAL, null).size());
        assertEquals(1, service.listar(Especialidade.CARDIOLOGIA, null).size());
        assertEquals(1, service.listar(null, TipoProfissional.CIRURGIAO).size());
    }

    @Test
    void deveImpedirRegistroDuplicadoMesmoComFormatacaoDiferente() {
        service.cadastrar(profissional(TipoProfissional.CLINICO_GERAL, "CRM-MG 48.213", null));

        assertThrows(RegistroProfissionalDuplicadoException.class,
                () -> service.cadastrar(profissional(TipoProfissional.CLINICO_GERAL, "crm mg 48213", null)));
    }

    @Test
    void deveRecusarSobreposicaoDeJanelasNoMesmoDia() {
        Long profissionalId = service.cadastrar(
                profissional(TipoProfissional.CLINICO_GERAL, "CRM-MG 4", null)).getId();
        service.adicionarDisponibilidade(profissionalId,
                disponibilidade(DiaSemana.SEGUNDA, "09:00", "12:00"));

        assertThrows(ConflitoDisponibilidadeException.class,
                () -> service.adicionarDisponibilidade(profissionalId,
                        disponibilidade(DiaSemana.SEGUNDA, "11:30", "13:00")));
        service.adicionarDisponibilidade(profissionalId,
                disponibilidade(DiaSemana.TERCA, "11:30", "13:00"));
    }

    @Test
    void especialistaSoAtendeNaPropriaEspecialidade() {
        Especialista especialista = (Especialista) service.cadastrar(
                profissional(TipoProfissional.ESPECIALISTA, "CRM-MG 5", Especialidade.CARDIOLOGIA));

        assertTrue(especialista.atendeNaEspecialidade(Especialidade.CARDIOLOGIA));
        assertFalse(especialista.atendeNaEspecialidade(Especialidade.NEUROLOGIA));
    }

    @Test
    void clinicoGeralRegistraEncaminhamento() {
        Long clinicoId = service.cadastrar(
                profissional(TipoProfissional.CLINICO_GERAL, "CRM-MG 6", null)).getId();
        EncaminhamentoRequest encaminhamento = new EncaminhamentoRequest();
        encaminhamento.setPacienteId(71L);
        encaminhamento.setEspecialidade(Especialidade.CARDIOLOGIA);
        encaminhamento.setMotivo("Investigação de palpitações");

        service.encaminhar(clinicoId, encaminhamento);

        assertEquals(1, service.listarEncaminhamentos(clinicoId).size());
        assertEquals(71L, service.listarEncaminhamentos(clinicoId).get(0).getPacienteId());
    }

    private ProfissionalRequest profissional(TipoProfissional tipo, String registro,
                                             Especialidade especialidade) {
        ProfissionalRequest request = new ProfissionalRequest();
        request.setTipo(tipo);
        request.setNome("Profissional de teste");
        request.setRegistroProfissional(registro);
        request.setTelefone("31999999999");
        request.setEmail("teste@vitalis.med.br");
        request.setEspecialidade(especialidade);
        return request;
    }

    private DisponibilidadeRequest disponibilidade(DiaSemana dia, String inicio, String fim) {
        DisponibilidadeRequest request = new DisponibilidadeRequest();
        request.setDiaSemana(dia);
        request.setHoraInicio(LocalTime.parse(inicio));
        request.setHoraFim(LocalTime.parse(fim));
        return request;
    }
}
