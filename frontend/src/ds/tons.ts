import type { Tom } from '@/lib/rotulos'

/** Classes por tom. Única ponte entre o tom semântico e as utilidades de cor. */
export const tons: Record<Tom, { suave: string; texto: string; ponto: string; borda: string }> = {
  brand: { suave: 'bg-brand-soft', texto: 'text-brand-ink', ponto: 'bg-brand', borda: 'border-brand' },
  ok: { suave: 'bg-ok-soft', texto: 'text-ok', ponto: 'bg-ok', borda: 'border-ok' },
  info: { suave: 'bg-info-soft', texto: 'text-info', ponto: 'bg-info', borda: 'border-info' },
  warn: { suave: 'bg-warn-soft', texto: 'text-warn', ponto: 'bg-warn', borda: 'border-warn' },
  danger: { suave: 'bg-danger-soft', texto: 'text-danger', ponto: 'bg-danger', borda: 'border-danger' },
  neutral: { suave: 'bg-neutral-soft', texto: 'text-neutral', ponto: 'bg-neutral', borda: 'border-neutral' },
}
