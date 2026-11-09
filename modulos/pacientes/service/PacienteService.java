package br.pucminas.vitalis.pacientes.service;

import br.pucminas.vitalis.comum.model.Endereco;
import br.pucminas.vitalis.comum.service.DadosInvalidosException;
import br.pucminas.vitalis.comum.service.RecursoNaoEncontradoException;
import br.pucminas.vitalis.comum.service.RegistroDuplicadoException;
import br.pucminas.vitalis.pacientes.dto.EnderecoDTO;
import br.pucminas.vitalis.pacientes.dto.PacienteRequest;
import br.pucminas.vitalis.pacientes.dto.PacienteResponse;
import br.pucminas.vitalis.pacientes.dto.PaginaResponse;
import br.pucminas.vitalis.pacientes.model.Paciente;
import br.pucminas.vitalis.pacientes.repository.PacienteRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * Regras de negócio de paciente.
 *
 * <p>É aqui que mora a decisão de "pode ou não pode". O controller não
 * decide nada e o repositório não sabe o que é permitido.
 */
@Service
public class PacienteService {

    private final PacienteRepository repository;

    public PacienteService(PacienteRepository repository) {
        this.repository = repository;
    }

    /**
     * Cadastra um paciente.
     *
     * @throws RegistroDuplicadoException se o CPF já existe — 409
     */
    public PacienteResponse criar(PacienteRequest dto) {
        validarCpfDisponivel(dto.getCpf(), null);
        Paciente paciente = new Paciente(
                dto.getNome().trim(),
                dto.getCpf(),
                dto.getDataNascimento(),
                dto.getTelefone().trim(),
                dto.getEmail().trim(),
                paraEndereco(dto.getEndereco()));
        validarDataNascimento(paciente);
        return PacienteResponse.de(repository.salvar(paciente));
    }

    public PacienteResponse buscarPorId(Long id) {
        return PacienteResponse.de(exigirExistente(id));
    }

    public PacienteResponse buscarPorCpf(String cpf) {
        Optional<Paciente> achado = repository.buscarPorCpf(cpf);
        if (!achado.isPresent()) {
            throw new RecursoNaoEncontradoException("Paciente", cpf);
        }
        return PacienteResponse.de(achado.get());
    }

    /** Lista apenas pacientes ativos. Desativado some da listagem mas continua acessível por id. */
    public PaginaResponse<PacienteResponse> listar(String nome, String cpf, int pagina, int tamanho) {
        List<Paciente> encontrados = repository.listar(nome, cpf);
        List<PacienteResponse> resposta = new ArrayList<>(encontrados.size());
        for (Paciente p : encontrados) {
            resposta.add(PacienteResponse.de(p));
        }
        return PaginaResponse.de(resposta, pagina, tamanho);
    }

    /**
     * Atualiza o cadastro. O CPF pode mudar — correção de digitação acontece —
     * mas continua tendo que ser único entre os demais pacientes.
     */
    public PacienteResponse atualizar(Long id, PacienteRequest dto) {
        Paciente paciente = exigirExistente(id);
        validarCpfDisponivel(dto.getCpf(), id);
        paciente.setNome(dto.getNome().trim());
        paciente.setCpf(dto.getCpf());
        paciente.setDataNascimento(dto.getDataNascimento());
        paciente.setTelefone(dto.getTelefone().trim());
        paciente.setEmail(dto.getEmail().trim());
        paciente.setEndereco(paraEndereco(dto.getEndereco()));
        validarDataNascimento(paciente);
        return PacienteResponse.de(repository.salvar(paciente));
    }

    /**
     * Desativa o paciente. <b>Não apaga.</b>
     *
     * <p>O histórico de consultas e internações referencia o paciente, e a RN6
     * exige que ele seja preservado. Exclusão física deixaria atendimentos
     * órfãos apontando para um paciente que não existe mais.
     */
    public void desativar(Long id) {
        Paciente paciente = exigirExistente(id);
        paciente.desativar();
        repository.salvar(paciente);
    }

    public void reativar(Long id) {
        Paciente paciente = exigirExistente(id);
        paciente.reativar();
        repository.salvar(paciente);
    }

    private Paciente exigirExistente(Long id) {
        Optional<Paciente> achado = repository.buscarPorId(id);
        if (!achado.isPresent()) {
            throw new RecursoNaoEncontradoException("Paciente", id);
        }
        return achado.get();
    }

    /** CPF é único. {@code idAtual} nulo no cadastro; preenchido na atualização. */
    private void validarCpfDisponivel(String cpf, Long idAtual) {
        Optional<Paciente> dono = repository.buscarPorCpf(cpf);
        if (dono.isPresent() && !dono.get().getId().equals(idAtual)) {
            throw new RegistroDuplicadoException("cpf", cpf);
        }
    }

    /**
     * Rede de segurança: a anotação {@code @Past} no DTO já barra isso, mas a
     * regra vale para qualquer caminho que crie um paciente, não só pela API.
     */
    private void validarDataNascimento(Paciente paciente) {
        if (!paciente.temDataNascimentoValida()) {
            throw new DadosInvalidosException("Data de nascimento inválida",
                    Collections.singletonList("dataNascimento não pode ser no futuro"));
        }
    }

    private static Endereco paraEndereco(EnderecoDTO dto) {
        return new Endereco(
                dto.getLogradouro().trim(),
                dto.getNumero().trim(),
                dto.getComplemento() == null ? null : dto.getComplemento().trim(),
                dto.getBairro().trim(),
                dto.getCidade().trim(),
                dto.getUf(),
                dto.getCep());
    }
}
