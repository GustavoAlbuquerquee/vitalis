import TearTicket from '@/ds/react-bits/TearTicket'
import { CodigoDeBarras } from '@/componentes/CodigoDeBarras'
import { nomeEspecialidade } from '@/componentes/dominio'
import type { Paciente, ProfissionalSaude } from '@/tipos/dominio'
import { diaDaSemanaCurto, formatarData } from '@/lib/formato'
import s from './Comprovante.module.css'

interface ComprovanteProps {
  paciente: Paciente
  profissional: ProfissionalSaude
  data: string
  horario: string
  duracao: number
  aoDestacar: () => void
}

/**
 * O comprovante de agendamento que a recepção entrega ao paciente.
 * Arrastar o canhoto destaca a senha — o gesto de "entregar o papel", agora na tela.
 */
export function Comprovante({ paciente, profissional, data, horario, duracao, aoDestacar }: ComprovanteProps) {
  // Senha de atendimento: letra da especialidade + dia + horário. Ex.: C-0614 (cardiologia, dia 06, 14h)
  const senha = `${profissional.especialidade[0]}-${data.slice(8)}${horario.slice(0, 2)}`
  return (
    <>
      <div className={s.palco}>
        <TearTicket
          width={460}
          height={220}
          stubSize={140}
          radius={14}
          holes={10}
          rotate={2}
          tiltMax={6}
          background="var(--surface)"
          color="var(--ink)"
          borderColor="var(--line-strong)"
          stubBackground="var(--brand-soft)"
          ariaLabel="Destacar o canhoto do comprovante"
          onTear={aoDestacar}
          stub={
            <div className={s.canhoto}>
              <span className={s.rotulo}>Senha</span>
              <span className={s.senha}>{senha}</span>
              <CodigoDeBarras numero={senha.replace(/\D/g, '')} className={s.barras} />
            </div>
          }
        >
          <div className={s.corpo}>
            <p className={s.sobretitulo}>Vitalis · Comprovante</p>
            <p className={s.paciente}>{paciente.nome}</p>
            <p className={s.profissional}>
              {profissional.nome} · {nomeEspecialidade(profissional)}
            </p>
            <div className={s.quando}>
              <div>
                <p className={s.rotulo}>{diaDaSemanaCurto(data)}</p>
                <p className={s.valor}>{formatarData(data)}</p>
              </div>
              <div>
                <p className={s.rotulo}>Horário</p>
                <p className={s.hora}>{horario}</p>
              </div>
              <div>
                <p className={s.rotulo}>Duração</p>
                <p className={s.valor}>{duracao} min</p>
              </div>
            </div>
          </div>
        </TearTicket>
      </div>
      <p className={s.instrucao}>Puxe o canhoto para o lado para destacá-lo e entregar ao paciente (ou foque nele e tecle Enter).</p>
    </>
  )
}
