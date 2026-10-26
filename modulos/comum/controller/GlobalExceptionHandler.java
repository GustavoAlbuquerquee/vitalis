package br.pucminas.vitalis.comum.controller;

import br.pucminas.vitalis.comum.dto.ErroResponse;
import br.pucminas.vitalis.comum.service.DadosInvalidosException;
import br.pucminas.vitalis.comum.service.HospitalException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

import javax.servlet.http.HttpServletRequest;
import javax.validation.ConstraintViolationException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final String CODIGO_DADOS_INVALIDOS = "DADOS_INVALIDOS";

    @ExceptionHandler(HospitalException.class)
    public ResponseEntity<ErroResponse> tratarHospitalException(
            HospitalException exception, HttpServletRequest request) {
        return resposta(exception.getStatus(), exception.getCodigo(), exception.getMessage(),
                request, exception.getDetalhes());
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ErroResponse> tratarErrosDeValidacao(
            BindException exception, HttpServletRequest request) {
        List<String> detalhes = exception.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.toList());
        DadosInvalidosException erro = new DadosInvalidosException(
                "Os dados informados são inválidos", detalhes);
        return tratarHospitalException(erro, request);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErroResponse> tratarViolacaoDeRestricao(
            ConstraintViolationException exception, HttpServletRequest request) {
        List<String> detalhes = exception.getConstraintViolations().stream()
                .map(violacao -> violacao.getPropertyPath() + ": " + violacao.getMessage())
                .collect(Collectors.toList());
        DadosInvalidosException erro = new DadosInvalidosException(
                "Os dados informados são inválidos", detalhes);
        return tratarHospitalException(erro, request);
    }

    @ExceptionHandler({
            HttpMessageNotReadableException.class,
            MissingServletRequestParameterException.class,
            MethodArgumentTypeMismatchException.class
    })
    public ResponseEntity<ErroResponse> tratarRequisicaoInvalida(
            Exception exception, HttpServletRequest request) {
        return resposta(HttpStatus.BAD_REQUEST, CODIGO_DADOS_INVALIDOS,
                "A requisição contém dados inválidos", request, Collections.<String>emptyList());
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ErroResponse> tratarRotaNaoEncontrada(
            NoHandlerFoundException exception, HttpServletRequest request) {
        return resposta(HttpStatus.NOT_FOUND, "RECURSO_NAO_ENCONTRADO",
                "A rota solicitada não foi encontrada", request, Collections.<String>emptyList());
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErroResponse> tratarMetodoNaoSuportado(
            HttpRequestMethodNotSupportedException exception, HttpServletRequest request) {
        return resposta(HttpStatus.METHOD_NOT_ALLOWED, "METODO_NAO_PERMITIDO",
                "O método HTTP não é permitido para esta rota", request,
                Collections.<String>emptyList());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResponse> tratarErroInterno(
            Exception exception, HttpServletRequest request) {
        LOGGER.error("Erro não tratado ao processar requisição {}", request.getRequestURI(), exception);
        return resposta(HttpStatus.INTERNAL_SERVER_ERROR, "ERRO_INTERNO",
                "Ocorreu um erro interno. Tente novamente mais tarde.", request,
                Collections.<String>emptyList());
    }

    private ResponseEntity<ErroResponse> resposta(HttpStatus status, String codigo,
                                                  String mensagem, HttpServletRequest request,
                                                  List<String> detalhes) {
        ErroResponse body = new ErroResponse(LocalDateTime.now(), status.value(), codigo,
                mensagem, request.getRequestURI(), detalhes);
        return ResponseEntity.status(status).body(body);
    }
}
