import type { Paciente } from '@/tipos/dominio'
import { idade } from '@/lib/datas'
import { formatarData } from '@/lib/formato'
import { cn } from '@/lib/cn'
import { CodigoDeBarras } from './CodigoDeBarras'
import { CpfProtegido } from './CpfProtegido'
import s from './Pulseira.module.css'

interface PulseiraProps {
  paciente: Paciente
  /** Número do quarto quando o paciente está internado. */
  quarto?: string
}

/**
 * A identidade do paciente no formato em que o hospital já a reconhece: a pulseira.
 * O código de barras codifica o número do prontuário em ITF, como nas pulseiras reais —
 * nunca o CPF, que fica mascarado na tela.
 */
export function Pulseira({ paciente: p, quarto }: PulseiraProps) {
  const prontuario = String(p.id).padStart(8, '0')
  const situacao = !p.ativo ? 'Desativado' : quarto ? `Internado · Quarto ${quarto}` : 'Ambulatorial'
  return (
    <div className={cn(s.pulseira, quarto && s.internado, !p.ativo && s.inativo)}>
      <div className={s.furos} aria-hidden>
        <span className={s.furo} />
        <span className={s.furo} />
        <span className={s.furo} />
      </div>
      <div className={s.etiqueta}>
        <div className={s.dados}>
          <p className={s.cabeca}>
            Vitalis · Prontuário
            <span className={s.situacao}>{situacao}</span>
          </p>
          <h1 className={s.nome}>{p.nome}</h1>
          <div className={s.linha}>
            <span className={s.campo}>
              <span className={s.rotulo}>Nasc.</span>
              <span className={s.mono}>{formatarData(p.dataNascimento)}</span>
              <span>({idade(p.dataNascimento)} anos)</span>
            </span>
            <span className={s.campo}>
              <span className={s.rotulo}>CPF</span>
              <CpfProtegido cpf={p.cpf} className={s.mono} />
            </span>
            <span className={s.campo}>
              <span className={s.rotulo}>Cidade</span>
              {p.endereco.cidade}/{p.endereco.uf}
            </span>
          </div>
        </div>
        <div className={s.codigo}>
          <CodigoDeBarras numero={prontuario} className={s.barras} />
          <span className={s.numero}>{prontuario}</span>
        </div>
      </div>
      <div className={s.fecho} aria-hidden>
        <span />
      </div>
    </div>
  )
}
