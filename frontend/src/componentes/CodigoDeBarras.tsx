/**
 * Código de barras Interleaved 2 of 5 (ITF) — o padrão numérico das pulseiras e etiquetas hospitalares.
 * Codificação real: um leitor ITF lê o número de volta.
 */
const PADROES = ['nnwwn', 'wnnnw', 'nwnnw', 'wwnnn', 'nnwnw', 'wnwnn', 'nwwnn', 'nnnww', 'wnnwn', 'nwnwn']

export function CodigoDeBarras({ numero, altura = 36, className }: { numero: string; altura?: number; className?: string }) {
  let d = numero.replace(/\D/g, '')
  if (d.length % 2) d = `0${d}` // ITF codifica pares de dígitos
  const N = 1
  const W = 2.5
  // sequência de larguras alternando barra/espaço, começando por barra
  const larguras: number[] = [N, N, N, N] // início
  for (let i = 0; i < d.length; i += 2) {
    const barras = PADROES[Number(d[i])]
    const espacos = PADROES[Number(d[i + 1])]
    for (let k = 0; k < 5; k++) larguras.push(barras[k] === 'w' ? W : N, espacos[k] === 'w' ? W : N)
  }
  larguras.push(W, N, N) // fim
  const total = larguras.reduce((a, b) => a + b, 0)
  let x = 0
  const barras = larguras.map((w, i) => {
    const r = i % 2 === 0 ? <rect key={i} x={x} y={0} width={w} height={altura} /> : null
    x += w
    return r
  })
  return (
    <svg viewBox={`0 0 ${total} ${altura}`} preserveAspectRatio="none" className={className} role="img" aria-label={`Código de barras ${numero}`} fill="currentColor">
      {barras}
    </svg>
  )
}
