package br.pucminas.vitalis.consultas.config;

import br.pucminas.vitalis.comum.service.HospitalException;
import br.pucminas.vitalis.pacientes.service.PacienteService;
import br.pucminas.vitalis.profissionais.service.ProfissionalService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpStatus;
import java.time.Clock;
import java.time.ZoneId;

@Configuration
public class ConsultaConfig {
    @Bean @ConditionalOnMissingBean
    public Clock clock() { return Clock.system(ZoneId.of("America/Sao_Paulo")); }

    @Bean @Profile("!demo") @ConditionalOnMissingBean(PacienteService.class)
    public PacienteService pacientesPendentes() { return id -> { throw cadastroPendente(); }; }

    @Bean @Profile("!demo") @ConditionalOnMissingBean(ProfissionalService.class)
    public ProfissionalService profissionaisPendentes() { return id -> { throw cadastroPendente(); }; }

    private HospitalException cadastroPendente() {
        return new HospitalException("CADASTRO_INDISPONIVEL", HttpStatus.SERVICE_UNAVAILABLE,
                "Integre os serviços de cadastro da Trilha A ou ative o perfil demo para experimentação") { };
    }
}
