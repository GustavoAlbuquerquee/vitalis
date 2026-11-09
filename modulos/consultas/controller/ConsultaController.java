package br.pucminas.vitalis.consultas.controller;

import br.pucminas.vitalis.consultas.dto.*;
import br.pucminas.vitalis.consultas.model.*;
import br.pucminas.vitalis.consultas.service.ConsultaService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import javax.validation.Valid;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/consultas")
public class ConsultaController {
    private final ConsultaService service;
    public ConsultaController(ConsultaService service) { this.service = service; }

    @PostMapping
    public ResponseEntity<ConsultaResponse> criar(@Valid @RequestBody CriarConsultaRequest dados) {
        ConsultaResponse resposta = service.criar(dados);
        return ResponseEntity.created(ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(resposta.id).toUri()).body(resposta);
    }

    @GetMapping("/{id}") public ConsultaResponse buscar(@PathVariable Long id) { return service.buscar(id); }

    @GetMapping
    public List<ConsultaResponse> listar(@RequestParam(required = false) Long profissionalId,
            @RequestParam(required = false) Long pacienteId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            @RequestParam(required = false) SituacaoConsulta status,
            @RequestParam(required = false) ModalidadeConsulta modalidade) {
        return service.listar(profissionalId, pacienteId, data, status, modalidade);
    }

    @PatchMapping("/{id}/confirmacao")
    public ConsultaResponse confirmar(@PathVariable Long id) { return service.confirmar(id); }
    @PatchMapping("/{id}/inicio")
    public ConsultaResponse iniciar(@PathVariable Long id) { return service.iniciar(id); }
    @PatchMapping("/{id}/conclusao")
    public ConsultaResponse concluir(@PathVariable Long id, @Valid @RequestBody ObservacoesRequest dados) {
        return service.concluir(id, dados.observacoes);
    }
    @PatchMapping("/{id}/nao-comparecimento")
    public ConsultaResponse registrarFalta(@PathVariable Long id) { return service.registrarFalta(id); }
    @PatchMapping("/{id}/observacoes")
    public ConsultaResponse registrarObservacoes(@PathVariable Long id, @Valid @RequestBody ObservacoesRequest dados) {
        return service.registrarObservacoes(id, dados.observacoes);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelar(@PathVariable Long id) {
        service.cancelar(id);
        return ResponseEntity.noContent().build();
    }
}
