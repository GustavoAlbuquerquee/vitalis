import { useEffect, useId, useState } from 'react'
import type { Consulta } from '@/tipos/dominio'
import { minutos } from '@/lib/datas'
import { plural } from '@/lib/formato'
import s from './TracadoDoDia.module.css'

const INICIO = 7
const FIM = 19
const L = 1000 // largura do viewBox
const A = 120 // altura do viewBox
const BASE = 82 // linha de base

/**
 * O fluxo do dia como fita de monitor cardíaco: cada hora do expediente é um batimento,
 * e a altura do pico é o número de consultas que começam naquela hora.
 * O que já passou é traçado cheio; o que falta, pontilhado. O ponto vermelho é agora.
 */
export function TracadoDoDia({ consultas }: { consultas: Consulta[] }) {
  const horas = Array.from({ length: FIM - INICIO }, (_, i) => INICIO + i)
  const porHora = horas.map((h) => consultas.filter((c) => Math.floor(minutos(c.horario) / 60) === h).length)
  const maximo = Math.max(1, ...porHora)

  const [agora, setAgora] = useState(() => new Date().getHours() + new Date().getMinutes() / 60)
  useEffect(() => {
    const t = setInterval(() => setAgora(new Date().getHours() + new Date().getMinutes() / 60), 60_000)
    return () => clearInterval(t)
  }, [])

  const largura = L / horas.length
  const xDe = (hora: number) => ((Math.min(Math.max(hora, INICIO), FIM) - INICIO) / (FIM - INICIO)) * L

  // Um batimento por hora: onda P, complexo QRS proporcional à carga, onda T
  const pontos: [number, number][] = [[0, BASE]]
  porHora.forEach((n, i) => {
    const x0 = i * largura
    const amp = n === 0 ? 0 : 12 + (n / maximo) * (BASE - 14)
    const at = (f: number, y: number) => pontos.push([x0 + f * largura, y])
    at(0.18, BASE)
    at(0.24, BASE - (n ? 5 : 0))
    at(0.3, BASE)
    at(0.4, BASE)
    at(0.44, BASE + (n ? 6 : 0))
    at(0.5, BASE - amp)
    at(0.56, BASE + (n ? 14 : 0))
    at(0.61, BASE)
    at(0.72, BASE)
    at(0.8, BASE - (n ? 9 : 0))
    at(0.88, BASE)
    at(1, BASE)
  })

  const xAgora = xDe(agora)
  const ate = (x: number) => pontos.filter(([px]) => px <= x)
  const caminho = (ps: [number, number][]) => ps.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const passado = caminho([...ate(xAgora), [xAgora, yEm(pontos, xAgora)]])
  const futuro = caminho([[xAgora, yEm(pontos, xAgora)], ...pontos.filter(([px]) => px > xAgora)])

  const clipe = useId()

  const horaAtual = Math.floor(agora)
  const nestaHora = horaAtual >= INICIO && horaAtual < FIM ? porHora[horaAtual - INICIO] : null
  const pico = porHora.indexOf(Math.max(...porHora))
  const emExpediente = agora >= INICIO && agora <= FIM

  return (
    <section className={s.monitor} aria-label="Fluxo de consultas do dia">
      <div className={s.fita}>
        <div className={s.topo}>
          <h2 className={s.titulo}>Fluxo do dia</h2>
          <span className={s.derivacao}>Consultas por hora · 07h–19h</span>
        </div>
        <svg className={s.svg} viewBox={`0 0 ${L} ${A}`} preserveAspectRatio="none" role="img" aria-label={horas.map((h, i) => `${h}h: ${porHora[i]}`).join(', ')}>
          <defs>
            {/* Revela o traçado da esquerda para a direita, como a fita correndo no monitor */}
            <clipPath id={clipe}>
              <rect x={0} y={-10} width={L} height={A + 20} className={s.revelar} />
            </clipPath>
          </defs>
          <path d={futuro} className={s.futuro} vectorEffect="non-scaling-stroke" />
          <path d={passado} className={s.passado} clipPath={`url(#${clipe})`} vectorEffect="non-scaling-stroke" />
          {emExpediente && (
            <>
              <line x1={xAgora} x2={xAgora} y1={4} y2={A - 4} className={s.cursor} vectorEffect="non-scaling-stroke" />
              <circle cx={xAgora} cy={yEm(pontos, xAgora)} r={4} className={s.halo} />
              <circle cx={xAgora} cy={yEm(pontos, xAgora)} r={3} className={s.ponto} />
            </>
          )}
        </svg>
        <div className={s.horas} aria-hidden>
          {[...horas, FIM]
            .filter((h) => h % 2 === 1)
            .map((h) => (
              <span key={h} style={{ left: `${((h - INICIO) / (FIM - INICIO)) * 100}%` }}>
                {String(h).padStart(2, '0')}h
              </span>
            ))}
        </div>
      </div>
      <div className={s.visor}>
        <div>
          <p className={s.leituraRotulo}>{nestaHora === null ? 'Fora do expediente' : `Agora · ${String(horaAtual).padStart(2, '0')}h`}</p>
          <p className={s.leituraValor}>
            {nestaHora ?? '--'}
            <span className={s.leituraUnidade}>cons/h</span>
          </p>
        </div>
        <div>
          <p className={s.leituraRotulo}>Pico do dia</p>
          <p className={s.leituraPequena}>
            {String(INICIO + pico).padStart(2, '0')}h · {plural(porHora[pico], 'consulta')}
          </p>
        </div>
        <div>
          <p className={s.leituraRotulo}>Total</p>
          <p className={s.leituraPequena}>{plural(consultas.length, 'consulta')}</p>
        </div>
      </div>
    </section>
  )
}

/** Altura do traçado num x qualquer, interpolando entre os pontos vizinhos. */
function yEm(pontos: [number, number][], x: number): number {
  for (let i = 1; i < pontos.length; i++) {
    const [x0, y0] = pontos[i - 1]
    const [x1, y1] = pontos[i]
    if (x <= x1) return x1 === x0 ? y1 : y0 + ((x - x0) / (x1 - x0)) * (y1 - y0)
  }
  return pontos[pontos.length - 1][1]
}
