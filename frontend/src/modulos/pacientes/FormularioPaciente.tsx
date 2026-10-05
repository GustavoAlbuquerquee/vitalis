import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { UserX } from 'lucide-react'
import { Botao, CabecalhoPagina, Campo, Cartao, Entrada, Modal, Pagina, Secao, Selecao, usePrototipo } from '@/ds'
import { NaoEncontrada } from '@/app/NaoEncontrada'
import { buscarPaciente, internacaoAtivaDoPaciente, listarPacientes } from '@/api'
import { hoje } from '@/lib/datas'
import { formatarCep, formatarCpf, formatarTelefone, mascaraCep, mascaraCpf, mascaraTelefone } from '@/lib/formato'
import { ufs } from '@/lib/rotulos'
import type { UF } from '@/tipos/dominio'
import s from './FormularioPaciente.module.css'

interface Dados {
  nome: string
  cpf: string
  dataNascimento: string
  telefone: string
  email: string
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  uf: UF
}

const vazio: Dados = {
  nome: '',
  cpf: '',
  dataNascimento: '',
  telefone: '',
  email: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: 'Belo Horizonte',
  uf: 'MG',
}

/** Dígitos verificadores do CPF — o mesmo cálculo que o back-end fará no DTO. */
function cpfValido(cpf: string): boolean {
  const d = cpf.replace(/\D/g, '')
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false
  const dv = (n: number) => {
    const soma = [...d.slice(0, n)].reduce((acc, x, i) => acc + Number(x) * (n + 1 - i), 0)
    const r = (soma * 10) % 11
    return r === 10 ? 0 : r
  }
  return dv(9) === Number(d[9]) && dv(10) === Number(d[10])
}

function validar(d: Dados, idAtual?: number): Partial<Record<keyof Dados, string>> {
  const e: Partial<Record<keyof Dados, string>> = {}
  if (d.nome.trim().split(/\s+/).length < 2) e.nome = 'Informe nome e sobrenome.'
  if (!cpfValido(d.cpf)) e.cpf = 'CPF inválido — confira os dígitos.'
  else if (listarPacientes().some((p) => p.cpf === d.cpf.replace(/\D/g, '') && p.id !== idAtual)) e.cpf = 'Já existe um paciente com este CPF.'
  if (!d.dataNascimento) e.dataNascimento = 'Informe a data de nascimento.'
  else if (d.dataNascimento > hoje()) e.dataNascimento = 'A data de nascimento não pode ser futura.'
  if (d.telefone.replace(/\D/g, '').length < 10) e.telefone = 'Telefone com DDD.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) e.email = 'E-mail em formato inválido.'
  if (d.cep.replace(/\D/g, '').length !== 8) e.cep = 'CEP com 8 dígitos.'
  if (!d.logradouro.trim()) e.logradouro = 'Obrigatório.'
  if (!d.numero.trim()) e.numero = 'Obrigatório.'
  if (!d.bairro.trim()) e.bairro = 'Obrigatório.'
  if (!d.cidade.trim()) e.cidade = 'Obrigatório.'
  return e
}

export function FormularioPaciente() {
  const { id } = useParams()
  const navegar = useNavigate()
  const prototipo = usePrototipo()
  const existente = id ? buscarPaciente(Number(id)) : undefined

  const [dados, setDados] = useState<Dados>(() =>
    existente
      ? {
          nome: existente.nome,
          cpf: formatarCpf(existente.cpf),
          dataNascimento: existente.dataNascimento,
          telefone: formatarTelefone(existente.telefone),
          email: existente.email,
          cep: formatarCep(existente.endereco.cep),
          logradouro: existente.endereco.logradouro,
          numero: existente.endereco.numero,
          complemento: existente.endereco.complemento ?? '',
          bairro: existente.endereco.bairro,
          cidade: existente.endereco.cidade,
          uf: existente.endereco.uf,
        }
      : vazio,
  )
  const [erros, setErros] = useState<Partial<Record<keyof Dados, string>>>({})
  const [tentou, setTentou] = useState(false)
  const [desativar, setDesativar] = useState(false)

  if (id && !existente) return <NaoEncontrada titulo="Paciente não encontrado" voltarPara="/pacientes" voltarRotulo="Voltar aos pacientes" />

  const campo = <K extends keyof Dados>(k: K, mascara?: (v: string) => string) => ({
    value: dados[k],
    onChange: (e: { target: { value: string } }) => {
      const novo = { ...dados, [k]: mascara ? mascara(e.target.value) : e.target.value }
      setDados(novo)
      if (tentou) setErros(validar(novo, existente?.id))
    },
  })

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    setTentou(true)
    const encontrados = validar(dados, existente?.id)
    setErros(encontrados)
    if (Object.keys(encontrados).length) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }
    prototipo(existente ? 'Cadastro atualizado' : 'Paciente cadastrado')
    navegar(existente ? `/pacientes/${existente.id}` : '/pacientes')
  }

  const internado = existente && internacaoAtivaDoPaciente(existente.id)

  return (
    <Pagina estreita>
      <CabecalhoPagina
        migalhas={[
          { rotulo: 'Pacientes', para: '/pacientes' },
          ...(existente ? [{ rotulo: existente.nome, para: `/pacientes/${existente.id}` }, { rotulo: 'Editar' }] : [{ rotulo: 'Novo paciente' }]),
        ]}
        titulo={existente ? 'Editar cadastro' : 'Novo paciente'}
        descricao="Campos marcados com * são obrigatórios."
      />

      <form onSubmit={enviar} noValidate>
        <Cartao className={s.cartao}>
          <Secao titulo="Identificação" descricao="O CPF identifica o paciente e não se repete no cadastro.">
            <Campo rotulo="Nome completo" obrigatorio erro={erros.nome}>
              {(p) => <Entrada {...p} {...campo('nome')} autoComplete="name" />}
            </Campo>
            <Campo rotulo="CPF" obrigatorio erro={erros.cpf} colunas={3}>
              {(p) => <Entrada {...p} {...campo('cpf', mascaraCpf)} mono inputMode="numeric" placeholder="000.000.000-00" />}
            </Campo>
            <Campo rotulo="Data de nascimento" obrigatorio erro={erros.dataNascimento} colunas={3}>
              {(p) => <Entrada {...p} {...campo('dataNascimento')} type="date" max={hoje()} />}
            </Campo>
          </Secao>

          <Secao titulo="Contato" descricao="Usado para confirmar consultas e avisar sobre altas.">
            <Campo rotulo="Telefone" obrigatorio erro={erros.telefone} colunas={3}>
              {(p) => <Entrada {...p} {...campo('telefone', mascaraTelefone)} type="tel" placeholder="(31) 90000-0000" autoComplete="tel" />}
            </Campo>
            <Campo rotulo="E-mail" obrigatorio erro={erros.email} colunas={3}>
              {(p) => <Entrada {...p} {...campo('email')} type="email" placeholder="nome@exemplo.com" autoComplete="email" />}
            </Campo>
          </Secao>

          <Secao titulo="Endereço">
            <Campo rotulo="CEP" obrigatorio erro={erros.cep} colunas={2}>
              {(p) => <Entrada {...p} {...campo('cep', mascaraCep)} mono inputMode="numeric" placeholder="00000-000" autoComplete="postal-code" />}
            </Campo>
            <Campo rotulo="Logradouro" obrigatorio erro={erros.logradouro} colunas={4}>
              {(p) => <Entrada {...p} {...campo('logradouro')} autoComplete="address-line1" />}
            </Campo>
            <Campo rotulo="Número" obrigatorio erro={erros.numero} colunas={2}>
              {(p) => <Entrada {...p} {...campo('numero')} />}
            </Campo>
            <Campo rotulo="Complemento" colunas={4}>
              {(p) => <Entrada {...p} {...campo('complemento')} placeholder="Apto, bloco, casa…" autoComplete="address-line2" />}
            </Campo>
            <Campo rotulo="Bairro" obrigatorio erro={erros.bairro} colunas={2}>
              {(p) => <Entrada {...p} {...campo('bairro')} />}
            </Campo>
            <Campo rotulo="Cidade" obrigatorio erro={erros.cidade} colunas={3}>
              {(p) => <Entrada {...p} {...campo('cidade')} autoComplete="address-level2" />}
            </Campo>
            <Campo rotulo="UF" obrigatorio colunas={1}>
              {(p) => (
                <Selecao {...p} value={dados.uf} onChange={(e) => setDados({ ...dados, uf: e.target.value as UF })}>
                  {ufs.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </Selecao>
              )}
            </Campo>
          </Secao>
        </Cartao>

        <div className={s.acoes}>
          <Botao variante="fantasma" onClick={() => navegar(-1)}>
            Cancelar
          </Botao>
          <Botao type="submit" variante="primario">
            {existente ? 'Salvar alterações' : 'Cadastrar paciente'}
          </Botao>
        </div>
      </form>

      {existente && existente.ativo && (
        <Cartao className={s.perigo}>
          <div>
            <p className={s.perigoTitulo}>Desativar paciente</p>
            <p className={s.perigoTexto}>O cadastro sai das listas, mas todo o histórico é mantido. Nada é excluído (RN1).</p>
          </div>
          <Botao variante="secundario" className={s.botaoPerigo} icone={<UserX />} onClick={() => setDesativar(true)}>
            Desativar
          </Botao>
        </Cartao>
      )}

      <Modal
        aberto={desativar}
        aoFechar={() => setDesativar(false)}
        titulo={`Desativar ${existente?.nome.split(' ')[0]}?`}
        descricao="O paciente deixa de aparecer nas buscas e não pode ser agendado. Consultas, internações e registros clínicos continuam no histórico."
        largura="sm"
        rodape={
          <>
            <Botao variante="fantasma" onClick={() => setDesativar(false)}>
              Cancelar
            </Botao>
            <Botao
              variante="perigo"
              disabled={Boolean(internado)}
              onClick={() => {
                setDesativar(false)
                prototipo('Paciente desativado')
                navegar('/pacientes')
              }}
            >
              Desativar paciente
            </Botao>
          </>
        }
      >
        {internado && <p className={s.avisoInternado}>Este paciente está internado. Registre a alta antes de desativar o cadastro.</p>}
      </Modal>
    </Pagina>
  )
}
