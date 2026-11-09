package br.pucminas.vitalis.quartos.controller;

import br.pucminas.vitalis.quartos.dto.BloqueioQuartoRequest;
import br.pucminas.vitalis.quartos.dto.QuartoRequest;
import br.pucminas.vitalis.quartos.model.Quarto;
import br.pucminas.vitalis.quartos.model.SituacaoQuarto;
import br.pucminas.vitalis.quartos.model.TipoQuarto;
import br.pucminas.vitalis.quartos.service.QuartoService;
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
@RequestMapping("/quartos")
public class QuartoController {

    private final QuartoService service;

    public QuartoController(QuartoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Quarto> cadastrar(@Valid @RequestBody QuartoRequest request,
                                            UriComponentsBuilder uriBuilder) {
        Quarto quarto = service.cadastrar(request);
        URI location = uriBuilder.path("/quartos/{id}")
                .buildAndExpand(quarto.getId()).toUri();
        return ResponseEntity.created(location).body(quarto);
    }

    @GetMapping("/{id}")
    public Quarto buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @GetMapping
    public List<Quarto> listar(@RequestParam(required = false) SituacaoQuarto situacao,
                               @RequestParam(required = false) Integer andar,
                               @RequestParam(required = false) TipoQuarto tipo) {
        return service.listar(situacao, andar, tipo);
    }

    @GetMapping("/{id}/ocupacao")
    public Quarto ocupacao(@PathVariable Long id) {
        return service.buscar(id);
    }

    @PatchMapping("/{id}/situacao")
    public Quarto atualizarSituacao(@PathVariable Long id,
                                    @Valid @RequestBody BloqueioQuartoRequest request) {
        return service.atualizarBloqueio(id, request.getSituacao());
    }
}
