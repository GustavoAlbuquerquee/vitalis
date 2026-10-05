import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { CalendarClock } from 'lucide-react'
import { Botao, CabecalhoPagina, Campo, Cartao, Entrada, Pagina, Secao, Selecao, usePrototipo } from '@/ds'
import { buscarProfissional, listarProfissionais } from '@/api'
import { mascaraTelefone } from '@/lib/formato'
import { especialidades } from '@/lib/rotulos'
import type { Especialidade } from '@/tipos/dominio'
import { NaoEncontrada } from '@/app/NaoEncontrada'

interface Dados {
  nome: string
  especialidade: Especialidade | ''
  registro: string
  telefone: string
  email: string
}

type Erros = Partial<Record<keyof Dados, string>>

/** Formato de exemplo e nome por extenso de cada conselho de classe. */
const conselhos: Record<string, { exemplo: string; nome: string }> = {
  CRM: { exemplo: 'CRM-MG 00.000', nome: 'Conselho Regional de Medicina' },
  COREN: { exemplo: 'COREN-MG 000.000', nome: 'Conselho Regional de Enfermagem' },
  CREFITO: { exemplo: 'CREFITO-4 000.000-F', nome: 'Conselho Regional de Fisioterapia e Terapia Ocupacional' },
}

// Compara registros ignorando pontuação, espaço e caixa: "CRM-MG 48.213" = "crm mg 48213"
const chaveRegistro = (r: string) => r.replace(/[^0-9a-z]/gi, '').toUpperCase()

const emailValido = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

function validar(d: Dados, idAtual?: number): Erros {
  const erros: Erros = {}
  if (!d.nome.trim()) erros.nome = 'Informe o nome do profissional'
  else if (d.nome.trim().length < 3) erros.nome = 'Nome muito curto'
  if (!d.especialidade) erros.especialidade = 'Escolha a especialidade'
  if (!d.registro.trim()) erros.registro = 'Informe o registro profissional'
  else {
    const repetido = listarProfissionais().find((p) => p.id !== idAtual && chaveRegistro(p.registroProfissional) === chaveRegistro(d.registro))
    if (repetido) erros.registro = `Registro já cadastrado para ${repetido.nome}`
  }
  const digitos = d.telefone.replace(/\D/g, '')
  if (!digitos) erros.telefone = 'Informe um telefone de contato'
  else if (digitos.length < 10) erros.telefone = 'Telefone incompleto — inclua o DDD'
  if (!d.email.trim()) erros.email = 'Informe um e-mail de contato'
  else if (!emailValido(d.email.trim())) erros.email = 'E-mail em formato inválido'
  return erros
}

export function FormularioProfissional() {
  const { id } = useParams()
  const edicao = id !== undefined
  const profissional = edicao ? buscarProfissional(Number(id)) : undefined
  if (edicao && !profissional) return <NaoEncontrada titulo="Profissional não encontrado" voltarPara="/profissionais" voltarRotulo="Voltar aos profissionais" />

  const inicial: Dados = profissional
    ? {
        nome: profissional.nome,
        especialidade: profissional.especialidade,
        registro: profissional.registroProfissional,
        telefone: mascaraTelefone(profissional.telefone),
        email: profissional.email,
      }
    : { nome: '', especialidade: '', registro: '', telefone: '', email: '' }

  return <Formulario key={id ?? 'novo'} inicial={inicial} idAtual={profissional?.id} nomeAtual={profissional?.nome} />
}

function Formulario({ inicial, idAtual, nomeAtual }: { inicial: Dados; idAtual?: number; nomeAtual?: string }) {
  const navegar = useNavigate()
  const prototipo = usePrototipo()
  const form = useRef<HTMLFormElement>(null)
  const [dados, setDados] = useState<Dados>(inicial)
  const [erros, setErros] = useState<Erros>({})
  const edicao = idAtual !== undefined

  const conselho = dados.especialidade ? especialidades[dados.especialidade].conselho : undefined
  const infoConselho = conselho ? conselhos[conselho] : undefined

  const mudar = <K extends keyof Dados>(campo: K, valor: Dados[K]) => {
    setDados((d) => ({ ...d, [campo]: valor }))
    if (erros[campo]) setErros((e) => ({ ...e, [campo]: undefined }))
  }

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    const novos = validar(dados, idAtual)
    setErros(novos)
    if (Object.keys(novos).length) {
      // Leva o foco ao primeiro campo com erro, depois que a tela marcar os campos
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    prototipo(edicao ? 'Cadastro atualizado' : 'Profissional cadastrado')
    navegar(edicao ? `/profissionais/${idAtual}` : '/profissionais')
  }

  return (
    <Pagina estreita>
      <CabecalhoPagina
        migalhas={
          edicao
            ? [{ rotulo: 'Profissionais', para: '/profissionais' }, { rotulo: nomeAtual!, para: `/profissionais/${idAtual}` }, { rotulo: 'Editar' }]
            : [{ rotulo: 'Profissionais', para: '/profissionais' }, { rotulo: 'Novo profissional' }]
        }
        titulo={edicao ? 'Editar cadastro' : 'Novo profissional'}
        descricao={edicao ? nomeAtual : 'Cadastro de profissional da saúde: identificação e contato.'}
      />

      <form ref={form} onSubmit={enviar} noValidate>
        <Cartao className="px-5 py-7 sm:px-8">
          <Secao titulo="Identificação" descricao="Como o profissional aparece na agenda e nos atendimentos.">
            <Campo rotulo="Nome" obrigatorio erro={erros.nome} ajuda="Inclua o tratamento usado na agenda: Dr., Dra., Enf., Ft." className="sm:col-span-6">
              {(p) => <Entrada {...p} value={dados.nome} onChange={(e) => mudar('nome', e.target.value)} autoComplete="name" placeholder="Dra. Maria Souza" />}
            </Campo>
            <Campo rotulo="Especialidade" obrigatorio erro={erros.especialidade} className="sm:col-span-3">
              {(p) => (
                <Selecao {...p} value={dados.especialidade} onChange={(e) => mudar('especialidade', e.target.value as Especialidade)}>
                  <option value="" disabled>
                    Escolha…
                  </option>
                  {(Object.keys(especialidades) as Especialidade[]).map((e) => (
                    <option key={e} value={e}>
                      {especialidades[e].rotulo}
                    </option>
                  ))}
                </Selecao>
              )}
            </Campo>
            <Campo
              rotulo="Registro profissional"
              obrigatorio
              erro={erros.registro}
              ajuda={conselho && infoConselho ? `Número no ${conselho} — ${infoConselho.nome}. Único no sistema.` : 'Número no conselho de classe (CRM, COREN, CREFITO). Único no sistema.'}
              className="sm:col-span-3"
            >
              {(p) => (
                <Entrada {...p} mono value={dados.registro} onChange={(e) => mudar('registro', e.target.value)} placeholder={infoConselho?.exemplo ?? 'CRM-MG 00.000'} />
              )}
            </Campo>
          </Secao>

          <Secao titulo="Contato" descricao="Usado pela recepção para avisos de agenda.">
            <Campo rotulo="Telefone" obrigatorio erro={erros.telefone} className="sm:col-span-2">
              {(p) => (
                <Entrada
                  {...p}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  className="tabular"
                  value={dados.telefone}
                  onChange={(e) => mudar('telefone', mascaraTelefone(e.target.value))}
                  placeholder="(31) 3132-0000"
                />
              )}
            </Campo>
            <Campo rotulo="E-mail" obrigatorio erro={erros.email} className="sm:col-span-4">
              {(p) => (
                <Entrada {...p} type="email" autoComplete="email" value={dados.email} onChange={(e) => mudar('email', e.target.value)} placeholder="nome.sobrenome@vitalis.med.br" />
              )}
            </Campo>
          </Secao>

          <Secao titulo="Disponibilidade">
            <div className="flex gap-3 rounded-card bg-surface-2 p-3.5 text-sm text-ink-2 sm:col-span-6">
              <CalendarClock className="mt-0.5 size-[18px] shrink-0 text-ink-3" aria-hidden />
              <p>
                As janelas de atendimento são definidas na página do profissional
                {edicao ? (
                  <>
                    {' — '}
                    <Link to={`/profissionais/${idAtual}`} className="font-medium text-brand hover:underline">
                      ver disponibilidade semanal
                    </Link>
                    .
                  </>
                ) : (
                  ', depois do cadastro.'
                )}
              </p>
            </div>
          </Secao>
        </Cartao>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Botao variante="fantasma" onClick={() => navegar(-1)}>
            Cancelar
          </Botao>
          <Botao variante="primario" type="submit">
            {edicao ? 'Salvar alterações' : 'Cadastrar profissional'}
          </Botao>
        </div>
      </form>
    </Pagina>
  )
}
