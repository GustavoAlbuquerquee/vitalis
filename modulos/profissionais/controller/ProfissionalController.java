package br.pucminas.vitalis.profissionais.controller;

import br.pucminas.vitalis.profissionais.dto.DisponibilidadeRequest;
import br.pucminas.vitalis.profissionais.dto.AgendaProfissionalResponse;
import br.pucminas.vitalis.profissionais.dto.EncaminhamentoRequest;
import br.pucminas.vitalis.profissionais.dto.ProfissionalRequest;
import br.pucminas.vitalis.profissionais.model.Disponibilidade;
import br.pucminas.vitalis.profissionais.model.Encaminhamento;
import br.pucminas.vitalis.profissionais.model.Especialidade;
import br.pucminas.vitalis.profissionais.model.ProfissionalSaude;
import br.pucminas.vitalis.profissionais.model.TipoProfissional;
import br.pucminas.vitalis.profissionais.service.ProfissionalCadastroService;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import javax.validation.Valid;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/profissionais")
public class ProfissionalController {

    private final ProfissionalCadastroService service;

    public ProfissionalController(ProfissionalCadastroService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ProfissionalSaude> cadastrar(@Valid @RequestBody ProfissionalRequest request,
                                                        UriComponentsBuilder uriBuilder) {
        ProfissionalSaude profissional = service.cadastrar(request);
        URI location = uriBuilder.path("/profissionais/{id}")
                .buildAndExpand(profissional.getId()).toUri();
        return ResponseEntity.created(location).body(profissional);
    }

    @GetMapping("/{id}")
    public ProfissionalSaude buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @GetMapping
    public List<ProfissionalSaude> listar(
            @RequestParam(required = false) Especialidade especialidade,
            @RequestParam(required = false) TipoProfissional tipo) {
        return service.listar(especialidade, tipo);
    }

    @PutMapping("/{id}")
    public ProfissionalSaude atualizar(@PathVariable Long id,
                                       @Valid @RequestBody ProfissionalRequest request) {
        return service.atualizar(id, request);
    }

    @PostMapping("/{id}/disponibilidades")
    public ResponseEntity<Disponibilidade> adicionarDisponibilidade(
            @PathVariable Long id, @Valid @RequestBody DisponibilidadeRequest request,
            UriComponentsBuilder uriBuilder) {
        Disponibilidade disponibilidade = service.adicionarDisponibilidade(id, request);
        URI location = uriBuilder.path("/profissionais/{id}/disponibilidades/{disponibilidadeId}")
                .buildAndExpand(id, disponibilidade.getId()).toUri();
        return ResponseEntity.created(location).body(disponibilidade);
    }

    @PostMapping("/{id}/encaminhamentos")
    public ResponseEntity<Encaminhamento> encaminhar(@PathVariable Long id,
                                                     @Valid @RequestBody EncaminhamentoRequest request,
                                                     UriComponentsBuilder uriBuilder) {
        Encaminhamento encaminhamento = service.encaminhar(id, request);
        URI location = uriBuilder.path("/profissionais/{id}/encaminhamentos")
                .buildAndExpand(id).toUri();
        return ResponseEntity.created(location).body(encaminhamento);
    }

    @GetMapping("/{id}/encaminhamentos")
    public List<Encaminhamento> encaminhamentos(@PathVariable Long id) {
        return service.listarEncaminhamentos(id);
    }

    @GetMapping("/{id}/agenda")
    public AgendaProfissionalResponse agenda(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return service.agenda(id, data);
    }
}
