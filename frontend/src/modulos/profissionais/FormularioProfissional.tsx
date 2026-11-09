import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { CalendarClock } from 'lucide-react'
import { Botao, CabecalhoPagina, Campo, Cartao, Entrada, Pagina, Secao, Selecao, usePrototipo } from '@/ds'
import { buscarProfissional, listarProfissionais } from '@/api'
import { especialidadeDoProfissional } from '@/dominio/profissionais'
import { mascaraTelefone } from '@/lib/formato'
import { especialidades } from '@/lib/rotulos'
import type { Especialidade, TipoProfissional } from '@/tipos/dominio'
import { NaoEncontrada } from '@/app/NaoEncontrada'
import s from './FormularioProfissional.module.css'

interface Dados {
  nome: string
  tipo: TipoProfissional
  especialidade: Especialidade | ''
  areaCirurgica: string
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
  if (d.tipo === 'ESPECIALISTA' && !d.especialidade) erros.especialidade = 'Escolha a especialidade'
  if (d.tipo === 'CIRURGIAO' && !d.areaCirurgica.trim()) erros.areaCirurgica = 'Informe a área cirúrgica'
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
      tipo: profissional.tipo,
      especialidade: especialidadeDoProfissional(profissional) ?? '',
      areaCirurgica: profissional.tipo === 'CIRURGIAO' ? profissional.areaCirurgica : '',
      registro: profissional.registroProfissional,
        telefone: mascaraTelefone(profissional.telefone),
        email: profissional.email,
      }
    : { nome: '', tipo: 'ESPECIALISTA', especialidade: '', areaCirurgica: '', registro: '', telefone: '', email: '' }

  return <Formulario key={id ?? 'novo'} inicial={inicial} idAtual={profissional?.id} nomeAtual={profissional?.nome} />
}

function Formulario({ inicial, idAtual, nomeAtual }: { inicial: Dados; idAtual?: number; nomeAtual?: string }) {
  const navegar = useNavigate()
  const prototipo = usePrototipo()
  const form = useRef<HTMLFormElement>(null)
  const [dados, setDados] = useState<Dados>(inicial)
  const [erros, setErros] = useState<Erros>({})
  const edicao = idAtual !== undefined

  const conselho = dados.tipo === 'CIRURGIAO' ? 'CRM' : dados.especialidade ? especialidades[dados.especialidade].conselho : undefined
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
        <Cartao className={s.cartao}>
          <Secao titulo="Identificação" descricao="Como o profissional aparece na agenda e nos atendimentos.">
            <Campo rotulo="Nome" obrigatorio erro={erros.nome} ajuda="Inclua o tratamento usado na agenda: Dr., Dra., Enf., Ft.">
              {(p) => <Entrada {...p} value={dados.nome} onChange={(e) => mudar('nome', e.target.value)} autoComplete="name" placeholder="Dra. Maria Souza" />}
            </Campo>
            <Campo rotulo="Categoria profissional" obrigatorio colunas={3}>
              {(p) => (
                <Selecao {...p} value={dados.tipo} onChange={(e) => mudar('tipo', e.target.value as TipoProfissional)}>
                  <option value="CLINICO_GERAL">Clínico geral</option>
                  <option value="ESPECIALISTA">Especialista</option>
                  <option value="CIRURGIAO">Cirurgião</option>
                </Selecao>
              )}
            </Campo>
            {dados.tipo === 'ESPECIALISTA' && (
              <Campo rotulo="Especialidade" obrigatorio erro={erros.especialidade} colunas={3}>
                {(p) => (
                  <Selecao {...p} value={dados.especialidade} onChange={(e) => mudar('especialidade', e.target.value as Especialidade)}>
                    <option value="" disabled>
                      Escolha…
                    </option>
                    {(Object.keys(especialidades) as Especialidade[])
                      .filter((e) => e !== 'CLINICA_GERAL')
                      .map((e) => (
                        <option key={e} value={e}>
                          {especialidades[e].rotulo}
                        </option>
                      ))}
                  </Selecao>
                )}
              </Campo>
            )}
            {dados.tipo === 'CIRURGIAO' && (
              <Campo rotulo="Área cirúrgica" obrigatorio erro={erros.areaCirurgica} colunas={3}>
                {(p) => <Entrada {...p} value={dados.areaCirurgica} onChange={(e) => mudar('areaCirurgica', e.target.value)} placeholder="Cirurgia geral" />}
              </Campo>
            )}
            <Campo
              rotulo="Registro profissional"
              obrigatorio
              erro={erros.registro}
              ajuda={conselho && infoConselho ? `Número no ${conselho} — ${infoConselho.nome}. Único no sistema.` : 'Número no conselho de classe (CRM, COREN, CREFITO). Único no sistema.'}
              colunas={3}
            >
              {(p) => (
                <Entrada {...p} mono value={dados.registro} onChange={(e) => mudar('registro', e.target.value)} placeholder={infoConselho?.exemplo ?? 'CRM-MG 00.000'} />
              )}
            </Campo>
          </Secao>

          <Secao titulo="Contato" descricao="Usado pela recepção para avisos de agenda.">
            <Campo rotulo="Telefone" obrigatorio erro={erros.telefone} colunas={2}>
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
            <Campo rotulo="E-mail" obrigatorio erro={erros.email} colunas={4}>
              {(p) => (
                <Entrada {...p} type="email" autoComplete="email" value={dados.email} onChange={(e) => mudar('email', e.target.value)} placeholder="nome.sobrenome@vitalis.med.br" />
              )}
            </Campo>
          </Secao>

          <Secao titulo="Disponibilidade">
            <div className={s.disponibilidade}>
              <CalendarClock className={s.disponibilidadeIcone} aria-hidden />
              <p>
                As janelas de atendimento são definidas na página do profissional
                {edicao ? (
                  <>
                    {' — '}
                    <Link to={`/profissionais/${idAtual}`} className={s.link}>
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

        <div className={s.acoes}>
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
