import { useState } from 'react'
import SplitFlapText from '@/ds/react-bits/SplitFlapText'
import type { Consulta } from '@/tipos/dominio'
import { buscarPaciente, buscarProfissional } from '@/api'
import { normalizar } from '@/lib/formato'
import { cn } from '@/lib/cn'
import s from './PainelChamada.module.css'

const LARGURA = 15

/**
 * Nome como aparece num painel de sala de espera: primeiro nome e iniciais.
 * "Lívia Andrade Faria" → "LIVIA AF". Ninguém lê o nome completo de outra pessoa na TV da recepção.
 */
function nomeDePainel(nome: string): string {
  const [primeiro, ...resto] = normalizar(nome).toUpperCase().split(' ')
  return `${primeiro.slice(0, 8)} ${resto.map((p) => p[0]).join('')}`.trim()
}

/** O letreiro de chamada da recepção: as próximas consultas giram nas plaquinhas. */
export function PainelChamada({ consultas, rotulo }: { consultas: Consulta[]; rotulo: string }) {
  const fila = consultas.slice(0, 4)
  const [atual, setAtual] = useState(0)
  const frases = fila.map((c) => `${c.horario} ${nomeDePainel(buscarPaciente(c.pacienteId)!.nome)}`.slice(0, LARGURA))
  const consulta = fila[atual]
  const prof = consulta && buscarProfissional(consulta.profissionalId)

  return (
    <section className={s.placa} aria-label="Painel de chamada">
      <div className={s.topo}>
        <span>Painel de chamada</span>
        <span className={s.aoVivo}>
          <span className={s.led} aria-hidden />
          {rotulo}
        </span>
      </div>
      {fila.length === 0 ? (
        <p className={s.vazio}>SEM CHAMADAS PENDENTES</p>
      ) : (
        <>
          <div className={s.letreiro}>
            <SplitFlapText
              words={frases}
              padTo={LARGURA}
              loop
              cycleDelay={4200}
              flipDuration={0.07}
              stagger={0.035}
              flipsPerChar={6}
              tileColor="var(--placa-tile)"
              textColor="var(--placa-texto)"
              tileRadius={3}
              gap={2}
              fontSize="clamp(12px, 3.7vw, 19px)"
              onPhraseChange={setAtual}
              aria-live="off"
            />
          </div>
          <div className={s.legenda}>
            <div className={s.legendaTexto} aria-live="polite">
              <p className={s.legendaProf}>{prof?.nome}</p>
              <p className={s.legendaMotivo}>{consulta?.motivo}</p>
            </div>
            <div className={s.posicoes} aria-hidden>
              {fila.map((c, i) => (
                <span key={c.id} className={cn(s.posicao, i === atual && s.posicaoAtual)} />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  )
}
