import { ArrowLeft, FileQuestion } from 'lucide-react'
import { BotaoLink, EstadoVazio, Pagina } from '@/ds'

export function NaoEncontrada({ titulo = 'Página não encontrada', voltarPara = '/', voltarRotulo = 'Voltar ao painel' }: { titulo?: string; voltarPara?: string; voltarRotulo?: string }) {
  return (
    <Pagina>
      <EstadoVazio
        className="py-24"
        icone={<FileQuestion />}
        titulo={titulo}
        descricao="O endereço pode estar errado ou o registro não existe. Nada é apagado no Vitalis — confira o identificador."
        acao={
          <BotaoLink to={voltarPara} icone={<ArrowLeft />}>
            {voltarRotulo}
          </BotaoLink>
        }
      />
    </Pagina>
  )
}
