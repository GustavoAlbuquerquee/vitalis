package br.pucminas.vitalis.pacientes.controller;

import br.pucminas.vitalis.pacientes.dto.PacienteRequest;
import br.pucminas.vitalis.pacientes.dto.PacienteResponse;
import br.pucminas.vitalis.pacientes.dto.PaginaResponse;
import br.pucminas.vitalis.pacientes.service.PacienteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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

/**
 * API REST de pacientes.
 *
 * <p>O context path /api/v1 vem de application.properties — por isso o
 * mapeamento aqui é só /pacientes.
 *
 * <p>Não decide nada: recebe, delega e traduz para HTTP. Também não escreve
 * {@code try/catch} — quem converte exceção em resposta é o
 * {@code GlobalExceptionHandler}, num lugar só.
 */
@RestController
@RequestMapping("/pacientes")
public class PacienteController {

    private final PacienteService service;

    public PacienteController(PacienteService service) {
        this.service = service;
    }

    /** 201 com Location apontando para o recurso criado; 409 se o CPF já existe. */
    @PostMapping
    public ResponseEntity<PacienteResponse> criar(@Valid @RequestBody PacienteRequest dto,
                                                  UriComponentsBuilder uri) {
        PacienteResponse criado = service.criar(dto);
        URI local = uri.path("/pacientes/{id}").buildAndExpand(criado.getId()).toUri();
        return ResponseEntity.created(local).body(criado);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PacienteResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @GetMapping("/cpf/{cpf}")
    public ResponseEntity<PacienteResponse> buscarPorCpf(@PathVariable String cpf) {
        return ResponseEntity.ok(service.buscarPorCpf(cpf));
    }

    /** Lista os ativos. Busca por nome ignora acento e caixa. */
    @GetMapping
    public ResponseEntity<PaginaResponse<PacienteResponse>> listar(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) String cpf,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamanho) {
        return ResponseEntity.ok(service.listar(nome, cpf, pagina, tamanho));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PacienteResponse> atualizar(@PathVariable Long id,
                                                      @Valid @RequestBody PacienteRequest dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    /**
     * Desativa o paciente — não apaga. O histórico de atendimentos depende
     * dele continuar existindo (RN6).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(@PathVariable Long id) {
        service.desativar(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PatchMapping("/{id}/reativacao")
    public ResponseEntity<PacienteResponse> reativar(@PathVariable Long id) {
        service.reativar(id);
        return ResponseEntity.ok(service.buscarPorId(id));
    }
}
