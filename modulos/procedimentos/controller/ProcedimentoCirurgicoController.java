package br.pucminas.vitalis.procedimentos.controller;

import br.pucminas.vitalis.procedimentos.dto.ConclusaoProcedimentoRequest;
import br.pucminas.vitalis.procedimentos.dto.InicioProcedimentoRequest;
import br.pucminas.vitalis.procedimentos.dto.ProcedimentoCirurgicoRequest;
import br.pucminas.vitalis.procedimentos.model.ProcedimentoCirurgico;
import br.pucminas.vitalis.procedimentos.service.ProcedimentoCirurgicoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import javax.validation.Valid;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping
public class ProcedimentoCirurgicoController {

    private final ProcedimentoCirurgicoService service;

    public ProcedimentoCirurgicoController(ProcedimentoCirurgicoService service) {
        this.service = service;
    }

    @PostMapping("/procedimentos-cirurgicos")
    public ResponseEntity<ProcedimentoCirurgico> cadastrar(
            @Valid @RequestBody ProcedimentoCirurgicoRequest request,
            UriComponentsBuilder uriBuilder) {
        ProcedimentoCirurgico procedimento = service.cadastrar(request);
        URI location = uriBuilder.path("/procedimentos-cirurgicos/{id}")
                .buildAndExpand(procedimento.getId()).toUri();
        return ResponseEntity.created(location).body(procedimento);
    }

    @GetMapping("/procedimentos-cirurgicos")
    public List<ProcedimentoCirurgico> listar(
            @RequestParam(required = false) Long cirurgiaoId) {
        return service.listar(cirurgiaoId);
    }

    @GetMapping("/procedimentos-cirurgicos/{id}")
    public ProcedimentoCirurgico buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @PatchMapping("/procedimentos-cirurgicos/{id}/inicio")
    public ProcedimentoCirurgico iniciar(@PathVariable Long id,
                                         @Valid @RequestBody InicioProcedimentoRequest request) {
        return service.iniciar(id, request.getDataHoraEfetiva());
    }

    @PatchMapping("/procedimentos-cirurgicos/{id}/conclusao")
    public ProcedimentoCirurgico concluir(@PathVariable Long id,
                                          @Valid @RequestBody ConclusaoProcedimentoRequest request) {
        return service.concluir(id, request.getDataHoraConclusao(), request.getObservacoesPosOperatorias());
    }

    @PatchMapping("/procedimentos-cirurgicos/{id}/cancelamento")
    public ProcedimentoCirurgico cancelar(@PathVariable Long id) {
        return service.cancelar(id);
    }

    @GetMapping("/profissionais/{cirurgiaoId}/procedimentos-cirurgicos")
    public List<ProcedimentoCirurgico> listarDoCirurgiao(@PathVariable Long cirurgiaoId) {
        return service.listar(cirurgiaoId);
    }
}
