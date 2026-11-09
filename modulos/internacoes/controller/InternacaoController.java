package br.pucminas.vitalis.internacoes.controller;

import br.pucminas.vitalis.internacoes.dto.AltaRequest;
import br.pucminas.vitalis.internacoes.dto.InternacaoRequest;
import br.pucminas.vitalis.internacoes.dto.TransferenciaRequest;
import br.pucminas.vitalis.internacoes.model.Internacao;
import br.pucminas.vitalis.internacoes.model.StatusInternacao;
import br.pucminas.vitalis.internacoes.service.InternacaoService;
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
@RequestMapping("/internacoes")
public class InternacaoController {

    private final InternacaoService service;

    public InternacaoController(InternacaoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Internacao> internar(@Valid @RequestBody InternacaoRequest request,
                                               UriComponentsBuilder uriBuilder) {
        Internacao internacao = service.internar(request);
        URI location = uriBuilder.path("/internacoes/{id}")
                .buildAndExpand(internacao.getId()).toUri();
        return ResponseEntity.created(location).body(internacao);
    }

    @GetMapping("/{id}")
    public Internacao buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @GetMapping
    public List<Internacao> listar(@RequestParam(required = false) StatusInternacao status,
                                   @RequestParam(required = false) Long quartoId,
                                   @RequestParam(required = false) Long pacienteId) {
        return service.listar(status, quartoId, pacienteId);
    }

    @PatchMapping("/{id}/alta")
    public Internacao registrarAlta(@PathVariable Long id, @Valid @RequestBody AltaRequest request) {
        return service.registrarAlta(id, request.getDataEfetivaAlta());
    }

    @PatchMapping("/{id}/transferencia")
    public Internacao transferir(@PathVariable Long id,
                                 @Valid @RequestBody TransferenciaRequest request) {
        return service.transferir(id, request.getQuartoId());
    }
}
