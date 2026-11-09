import type { Especialidade, ProfissionalSaude } from '@/tipos/dominio'

export function especialidadeDoProfissional(profissional: ProfissionalSaude): Especialidade | undefined {
  if (profissional.tipo === 'ESPECIALISTA') return profissional.especialidade
  if (profissional.tipo === 'CLINICO_GERAL') return 'CLINICA_GERAL'
  return undefined
}
