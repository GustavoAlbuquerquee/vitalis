/*
 * Dados de exemplo — o front ainda não fala com a API.
 *
 * Tudo é gerado de forma determinística (gerador pseudoaleatório com semente fixa)
 * e relativo à data de hoje, para que as telas tenham sempre um dia "vivo" para mostrar.
 * Quando a API REST existir, este arquivo some e src/api/ passa a fazer fetch.
 */
import type {
  Consulta,
  DiaSemana,
  Disponibilidade,
  Especialidade,
  Internacao,
  Paciente,
  ProfissionalSaude,
  Quarto,
  RegistroClinico,
  StatusConsulta,
} from '@/tipos/dominio'
import { hhmm, hoje, indiceDiaSemana, minutos, somarDias } from '@/lib/datas'
import { diasSemana } from '@/lib/rotulos'

function gerador(semente: number) {
  let s = semente
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}
const aleatorio = gerador(20260314)
const escolher = <T,>(lista: readonly T[]): T => lista[Math.floor(aleatorio() * lista.length)]

const HOJE = hoje()

/* ───────────────────────── Profissionais ───────────────────────── */

const janela = (id: number, dias: DiaSemana[], inicio: string, fim: string): Disponibilidade[] =>
  dias.map((diaSemana, i) => ({ id: id * 10 + i, diaSemana, horaInicio: inicio, horaFim: fim }))

const UTEIS: DiaSemana[] = ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA']

const baseProfissionais: [string, Especialidade, string, Disponibilidade[]][] = [
  ['Dra. Helena Duarte', 'CARDIOLOGIA', 'CRM-MG 48.213', [...janela(1, ['SEGUNDA', 'QUARTA', 'SEXTA'], '08:00', '12:00'), ...janela(11, ['TERCA', 'QUINTA'], '13:00', '18:00')]],
  ['Dr. Rafael Moreira', 'CLINICA_GERAL', 'CRM-MG 52.904', janela(2, UTEIS, '07:00', '13:00')],
  ['Dra. Camila Teixeira', 'PEDIATRIA', 'CRM-MG 61.377', janela(3, UTEIS, '08:00', '14:00')],
  ['Dr. Marcos Vieira', 'ORTOPEDIA', 'CRM-MG 39.850', [...janela(4, ['SEGUNDA', 'TERCA', 'QUINTA'], '13:00', '19:00'), ...janela(14, ['SABADO'], '08:00', '12:00')]],
  ['Dra. Beatriz Lacerda', 'GINECOLOGIA', 'CRM-MG 57.126', janela(5, ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA'], '09:00', '15:00')],
  ['Dr. Tiago Albergaria', 'NEUROLOGIA', 'CRM-MG 44.581', janela(6, ['TERCA', 'QUARTA', 'SEXTA'], '10:00', '17:00')],
  ['Dr. André Campos', 'CLINICA_GERAL', 'CRM-MG 63.042', janela(7, UTEIS, '12:00', '19:00')],
  ['Enf. Juliana Rocha', 'ENFERMAGEM', 'COREN-MG 284.115', janela(8, UTEIS, '07:00', '15:00')],
  ['Ft. Lucas Amaral', 'FISIOTERAPIA', 'CREFITO-4 112.908-F', janela(9, ['SEGUNDA', 'QUARTA', 'SEXTA'], '07:00', '13:00')],
  ['Dra. Patrícia Nogueira', 'CARDIOLOGIA', 'CRM-MG 50.773', janela(10, ['SEGUNDA', 'TERCA', 'QUINTA', 'SEXTA'], '14:00', '19:00')],
  ['Enf. Renato Pires', 'ENFERMAGEM', 'COREN-MG 301.442', janela(15, UTEIS, '13:00', '19:00')],
  ['Dra. Larissa Fonseca', 'PEDIATRIA', 'CRM-MG 66.219', janela(16, ['QUARTA', 'QUINTA', 'SEXTA', 'SABADO'], '08:00', '13:00')],
]

export const profissionais: ProfissionalSaude[] = baseProfissionais.map(([nome, especialidade, registroProfissional, disponibilidades], i) => {
  const usuario = nome
    .replace(/^(Dra?\.|Enf\.|Ft\.)\s+/, '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(' ')
  return {
    id: i + 1,
    nome,
    especialidade,
    registroProfissional,
    disponibilidades,
    telefone: `3132${String(100000 + i * 7919).slice(-6)}`,
    email: `${usuario[0]}.${usuario[usuario.length - 1]}@vitalis.med.br`,
    ativo: true,
  }
})

/* ───────────────────────── Pacientes ───────────────────────── */

const nomesPacientes = [
  'Ana Clara Ribeiro', 'Bruno Henrique Santos', 'Carla Mendes Oliveira', 'Daniel Ferreira Lima',
  'Eduarda Costa Almeida', 'Felipe Augusto Rocha', 'Gabriela Martins Souza', 'Heitor Carvalho Dias',
  'Isabela Gomes Pereira', 'João Pedro Barbosa', 'Kátia Regina Moura', 'Leonardo Silva Cardoso',
  'Mariana Azevedo Pinto', 'Nicolas Araújo Freitas', 'Olívia Batista Correia', 'Paulo Roberto Nunes',
  'Rafaela Teixeira Lopes', 'Sebastião Alves Moreira', 'Tereza Cristina Prado', 'Vinícius Rezende Castro',
  'Yasmin Duarte Fernandes', 'Antônio Carlos Medeiros', 'Beatriz Souza Lacerda', 'Cláudio Márcio Vasconcelos',
  'Débora Lúcia Figueiredo', 'Elias Gonçalves Braga', 'Fernanda Melo Antunes', 'Geraldo Magela Fonseca',
  'Helena Viana Coutinho', 'Igor Matheus Tavares', 'Joana Darc Siqueira', 'Luiz Fernando Queiroz',
]

// Mais pacientes, combinando nomes e sobrenomes — sem eles cada paciente teria dezenas de consultas por mês
const prenomes = ['Alice', 'Arthur', 'Bernardo', 'Cecília', 'Davi', 'Elisa', 'Enzo', 'Fábio', 'Giovana', 'Gustavo', 'Henrique', 'Laura', 'Lívia', 'Lorena', 'Lucas', 'Manuela', 'Matheus', 'Miguel', 'Natália', 'Otávio', 'Pedro', 'Raquel', 'Renata', 'Samuel', 'Sofia', 'Valentina', 'Wagner', 'Zilda', 'Márcia', 'Rogério', 'Sandra', 'Túlio']
const sobrenomes = ['Andrade', 'Bastos', 'Campos', 'Diniz', 'Esteves', 'Faria', 'Guimarães', 'Henriques', 'Leite', 'Macedo', 'Nascimento', 'Oliveira', 'Paiva', 'Quintão', 'Ramos', 'Sales', 'Toledo', 'Valadares', 'Xavier', 'Zica']
for (let i = 0; nomesPacientes.length < 120; i++) {
  const nome = `${prenomes[(i * 7) % prenomes.length]} ${sobrenomes[(i * 3) % sobrenomes.length]} ${sobrenomes[(i * 11 + 5) % sobrenomes.length]}`
  if (!nomesPacientes.includes(nome) && nome.split(' ')[1] !== nome.split(' ')[2]) nomesPacientes.push(nome)
}

const logradouros = [
  ['Rua da Bahia', 'Centro'], ['Av. Afonso Pena', 'Funcionários'], ['Rua Pernambuco', 'Savassi'],
  ['Av. do Contorno', 'Santo Agostinho'], ['Rua Rio Grande do Norte', 'Lourdes'], ['Rua Itutinga', 'Minaslândia'],
  ['Av. Dom José Gaspar', 'Coração Eucarístico'], ['Rua Padre Eustáquio', 'Padre Eustáquio'],
  ['Av. Amazonas', 'Gameleira'], ['Rua Jacuí', 'Floresta'], ['Av. Cristiano Machado', 'Cidade Nova'],
  ['Rua dos Timbiras', 'Barro Preto'],
] as const

const cidades = [['Belo Horizonte', 'MG'], ['Belo Horizonte', 'MG'], ['Belo Horizonte', 'MG'], ['Contagem', 'MG'], ['Betim', 'MG'], ['Nova Lima', 'MG']] as const

function cpfValido(): string {
  const n = Array.from({ length: 9 }, () => Math.floor(aleatorio() * 10))
  const dv = (base: number[]) => {
    const soma = base.reduce((acc, d, i) => acc + d * (base.length + 1 - i), 0)
    const r = (soma * 10) % 11
    return r === 10 ? 0 : r
  }
  n.push(dv(n))
  n.push(dv(n))
  return n.join('')
}

export const pacientes: Paciente[] = nomesPacientes.map((nome, i) => {
  const [logradouro, bairro] = escolher(logradouros)
  const [cidade, uf] = escolher(cidades)
  const ano = 1942 + Math.floor(aleatorio() * 78)
  const mes = 1 + Math.floor(aleatorio() * 12)
  const dia = 1 + Math.floor(aleatorio() * 28)
  const partes = nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().split(' ')
  return {
    id: i + 1,
    nome,
    cpf: cpfValido(),
    dataNascimento: `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`,
    telefone: `319${String(Math.floor(aleatorio() * 1e8)).padStart(8, '0')}`,
    email: `${partes[0]}.${partes[partes.length - 1]}@${escolher(['gmail.com', 'outlook.com', 'yahoo.com.br', 'uol.com.br'])}`,
    endereco: {
      logradouro,
      numero: String(10 + Math.floor(aleatorio() * 1900)),
      complemento: aleatorio() > 0.55 ? `Apto ${100 + Math.floor(aleatorio() * 1200)}` : undefined,
      bairro,
      cidade,
      uf,
      cep: `30${String(Math.floor(aleatorio() * 1e6)).padStart(6, '0')}`,
    },
    ativo: i !== 30,
  }
})

/* ───────────────────────── Quartos ───────────────────────── */

const especQuartos: [string, number, number, Quarto['tipo'], Quarto['bloqueio']?][] = [
  ['201', 2, 4, 'ENFERMARIA'], ['202', 2, 4, 'ENFERMARIA'], ['203', 2, 3, 'ENFERMARIA'], ['204', 2, 3, 'ENFERMARIA'],
  ['205', 2, 4, 'ENFERMARIA', 'MANUTENCAO'], ['206', 2, 2, 'ENFERMARIA'],
  ['301', 3, 1, 'APARTAMENTO'], ['302', 3, 2, 'APARTAMENTO'], ['303', 3, 1, 'APARTAMENTO'], ['304', 3, 1, 'APARTAMENTO'],
  ['305', 3, 2, 'APARTAMENTO'], ['306', 3, 1, 'APARTAMENTO', 'INTERDITADO'], ['307', 3, 1, 'APARTAMENTO'], ['308', 3, 2, 'APARTAMENTO'],
  ['401', 4, 1, 'UTI'], ['402', 4, 1, 'UTI'], ['403', 4, 1, 'UTI'], ['404', 4, 1, 'UTI'],
  ['405', 4, 1, 'ISOLAMENTO'], ['406', 4, 1, 'ISOLAMENTO'],
]

export const quartos: Quarto[] = especQuartos.map(([numero, andar, capacidadeMaxima, tipo, bloqueio], i) => ({
  id: i + 1,
  numero,
  andar,
  capacidadeMaxima,
  tipo,
  bloqueio,
}))

/* ───────────────────────── Internações ───────────────────────── */

const motivosInternacao = [
  'Pneumonia adquirida na comunidade', 'Pós-operatório de artroplastia de quadril', 'Insuficiência cardíaca descompensada',
  'Crise hipertensiva', 'Pielonefrite aguda', 'Observação pós-AVC isquêmico', 'Celulite em membro inferior',
  'Desidratação grave', 'Exacerbação de DPOC', 'Fratura de fêmur', 'Bronquiolite', 'Infarto agudo do miocárdio',
  'Sepse de foco urinário', 'Pós-operatório de colecistectomia', 'Covid-19 com hipoxemia', 'Pancreatite aguda',
]

// [quartoNumero, pacienteId, profissionalId, diasDesdeEntrada, diasAteAltaPrevista, motivoIdx]
const ativas: [string, number, number, number, number, number][] = [
  ['201', 3, 2, 4, 2, 0], ['201', 18, 7, 2, 3, 4], ['201', 26, 2, 6, 0, 8],
  ['202', 11, 1, 3, 1, 2], ['202', 22, 7, 1, 4, 6], ['202', 28, 10, 5, 0, 3], ['202', 16, 2, 2, 2, 7],
  ['203', 6, 4, 8, 3, 1], ['203', 24, 4, 3, 5, 9],
  ['204', 15, 3, 2, 1, 10],
  ['206', 9, 5, 1, 1, 13], ['206', 20, 6, 7, 2, 5],
  ['301', 1, 1, 3, 2, 11], ['302', 13, 10, 1, 3, 2], ['304', 30, 7, 2, 0, 15],
  ['305', 27, 6, 4, 6, 5], ['308', 12, 2, 1, 2, 4],
  ['401', 8, 1, 5, 4, 11], ['402', 32, 7, 3, 5, 12], ['403', 21, 6, 9, 6, 5],
  ['405', 25, 2, 6, 3, 14],
]

const quartoPorNumero = (n: string) => quartos.find((q) => q.numero === n)!

export const internacoes: Internacao[] = []

ativas.forEach(([numero, pacienteId, profissionalId, entrouHa, altaEm, motivo]) => {
  const entrada = somarDias(HOJE, -entrouHa)
  internacoes.push({
    id: internacoes.length + 1,
    pacienteId,
    profissionalId,
    quartoId: quartoPorNumero(numero).id,
    dataEntrada: `${entrada}T${hhmm(7 * 60 + Math.floor(aleatorio() * 14) * 60 + (aleatorio() > 0.5 ? 30 : 0))}`,
    dataPrevistaAlta: somarDias(HOJE, altaEm),
    motivo: motivosInternacao[motivo],
    observacoes: aleatorio() > 0.5 ? 'Paciente estável, sinais vitais dentro da normalidade nas últimas 24h.' : undefined,
    status: 'ATIVA',
  })
})

// Histórico: internações encerradas
const encerradas: [string, number, number, number, number, number, Internacao['status']][] = [
  ['203', 1, 1, 210, 6, 2, 'ALTA_CONCEDIDA'], ['301', 3, 2, 95, 4, 0, 'ALTA_CONCEDIDA'], ['204', 5, 3, 60, 3, 10, 'ALTA_CONCEDIDA'],
  ['401', 6, 1, 140, 9, 11, 'TRANSFERIDA'], ['202', 11, 7, 33, 5, 4, 'ALTA_CONCEDIDA'], ['307', 14, 4, 48, 7, 9, 'ALTA_CONCEDIDA'],
  ['206', 2, 2, 20, 2, 7, 'ALTA_CONCEDIDA'], ['303', 10, 6, 75, 5, 5, 'ALTA_CONCEDIDA'], ['201', 19, 7, 12, 0, 3, 'CANCELADA'],
  ['302', 23, 10, 15, 4, 2, 'ALTA_CONCEDIDA'], ['405', 17, 2, 28, 10, 14, 'ALTA_CONCEDIDA'], ['204', 4, 3, 7, 2, 10, 'ALTA_CONCEDIDA'],
]

encerradas.forEach(([numero, pacienteId, profissionalId, entrouHa, duracao, motivo, status]) => {
  const entrada = somarDias(HOJE, -entrouHa)
  const saida = somarDias(entrada, duracao)
  internacoes.push({
    id: internacoes.length + 1,
    pacienteId,
    profissionalId,
    quartoId: quartoPorNumero(numero).id,
    dataEntrada: `${entrada}T${hhmm(8 * 60 + Math.floor(aleatorio() * 10) * 60)}`,
    dataPrevistaAlta: somarDias(entrada, duracao + (aleatorio() > 0.6 ? 1 : 0)),
    dataEfetivaAlta: status === 'CANCELADA' ? undefined : `${saida}T${hhmm(10 * 60 + Math.floor(aleatorio() * 6) * 60)}`,
    motivo: motivosInternacao[motivo],
    observacoes:
      status === 'TRANSFERIDA'
        ? 'Transferido para hospital de referência em cirurgia cardíaca.'
        : status === 'CANCELADA'
          ? 'Internação cancelada: paciente liberado após reavaliação no pronto atendimento.'
          : 'Alta com orientações e retorno ambulatorial agendado.',
    status,
  })
})

/* ───────────────────────── Consultas ───────────────────────── */

const motivosConsulta: Record<Especialidade, string[]> = {
  CARDIOLOGIA: ['Dor torácica aos esforços', 'Palpitações há duas semanas', 'Controle de hipertensão', 'Retorno pós-internação', 'Avaliação pré-operatória'],
  CLINICA_GERAL: ['Febre e tosse há 3 dias', 'Check-up anual', 'Dor abdominal', 'Cefaleia recorrente', 'Renovação de receita', 'Cansaço persistente'],
  PEDIATRIA: ['Puericultura — 6 meses', 'Febre e irritabilidade', 'Tosse persistente', 'Avaliação de crescimento', 'Vacinação em atraso'],
  ORTOPEDIA: ['Dor lombar crônica', 'Entorse de tornozelo', 'Dor no joelho ao subir escadas', 'Retorno pós-cirúrgico', 'Dor no ombro'],
  GINECOLOGIA: ['Consulta preventiva', 'Pré-natal — 2º trimestre', 'Irregularidade menstrual', 'Resultado de exames'],
  NEUROLOGIA: ['Enxaqueca refratária', 'Tontura e zumbido', 'Formigamento em mãos', 'Acompanhamento de epilepsia'],
  ENFERMAGEM: ['Curativo de ferida operatória', 'Aferição de pressão', 'Administração de medicação', 'Retirada de pontos'],
  FISIOTERAPIA: ['Reabilitação de joelho — sessão', 'Fisioterapia respiratória', 'Lombalgia — sessão', 'Reabilitação pós-AVC'],
}

const obsRealizada = [
  'Exame físico sem alterações significativas. Mantida conduta e solicitado retorno em 30 dias.',
  'Solicitados exames laboratoriais. Orientado repouso e hidratação.',
  'Ajustada dose da medicação de uso contínuo. Paciente orientado sobre sinais de alarme.',
  'Quadro compatível com infecção viral. Prescrito sintomático.',
  'Evolução favorável. Alta do acompanhamento com retorno se necessário.',
]

export const consultas: Consulta[] = []

/** Ocupado por internações: o profissional responsável não atende consulta no horário da visita (RN3 cruza os dois tipos). */
function preencherDia(data: string, densidade: number) {
  const dia = diasSemana[indiceDiaSemana(data)].valor
  for (const p of profissionais) {
    for (const j of p.disponibilidades.filter((d) => d.diaSemana === dia)) {
      let t = minutos(j.horaInicio)
      const fim = minutos(j.horaFim)
      while (t + 30 <= fim) {
        const duracao = p.especialidade === 'FISIOTERAPIA' ? 45 : p.especialidade === 'ENFERMAGEM' ? 20 : aleatorio() > 0.8 ? 60 : 30
        if (t + duracao > fim) break
        if (aleatorio() < densidade) {
          const passado = data < HOJE
          let status: StatusConsulta = 'AGENDADA'
          if (passado) {
            const r = aleatorio()
            status = r < 0.78 ? 'REALIZADA' : r < 0.9 ? 'CANCELADA' : 'NAO_COMPARECEU'
          } else if (aleatorio() < 0.06) {
            status = 'CANCELADA'
          }
          if (data === HOJE && t + duracao <= agoraMinutos() && status === 'AGENDADA') {
            status = aleatorio() < 0.9 ? 'REALIZADA' : 'NAO_COMPARECEU'
          }
          consultas.push({
            id: consultas.length + 1,
            pacienteId: 1 + Math.floor(aleatorio() * pacientes.length),
            profissionalId: p.id,
            data,
            horario: hhmm(t),
            duracaoMinutos: duracao,
            motivo: escolher(motivosConsulta[p.especialidade]),
            observacoesMedicas: status === 'REALIZADA' ? escolher(obsRealizada) : undefined,
            status,
          })
        }
        t += duracao
      }
    }
  }
}

function agoraMinutos() {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

// Hoje cheio para a agenda ter o que mostrar; o resto, esparso, para o histórico de cada paciente ficar crível
for (let d = -45; d <= 14; d++) {
  const data = somarDias(HOJE, d)
  const densidade = d === 0 ? 0.6 : Math.abs(d) <= 3 ? 0.35 : Math.abs(d) <= 7 ? 0.2 : 0.06
  preencherDia(data, densidade)
}

/* ───────────────────────── Registros clínicos ───────────────────────── */

export const registros: RegistroClinico[] = []

internacoes.forEach((i) => {
  const entrada = i.dataEntrada.split('T')[0]
  const fimIso = i.dataEfetivaAlta?.split('T')[0] ?? HOJE
  registros.push({
    id: registros.length + 1,
    atendimento: { tipo: 'internacao', id: i.id },
    autorId: i.profissionalId,
    tipo: 'ANAMNESE',
    descricao: `Admitido com quadro de ${i.motivo.toLowerCase()}. Nega alergias medicamentosas. Comorbidades em acompanhamento ambulatorial.`,
    dataRegistro: i.dataEntrada,
  })
  registros.push({
    id: registros.length + 1,
    atendimento: { tipo: 'internacao', id: i.id },
    autorId: i.profissionalId,
    tipo: 'DIAGNOSTICO',
    descricao: i.motivo,
    dataRegistro: `${entrada}T${hhmm(minutos(i.dataEntrada.split('T')[1]) + 90)}`,
  })
  registros.push({
    id: registros.length + 1,
    atendimento: { tipo: 'internacao', id: i.id },
    autorId: i.profissionalId,
    tipo: 'PRESCRICAO',
    descricao: escolher([
      'Ceftriaxona 1 g EV 12/12h · Dipirona 1 g EV se dor ou febre · Enoxaparina 40 mg SC 1x/dia',
      'Furosemida 40 mg EV 12/12h · Carvedilol 6,25 mg VO 12/12h · Restrição hídrica 1,2 L/dia',
      'Soro fisiológico 0,9% 1.500 mL/24h · Ondansetrona 8 mg EV se náusea · Omeprazol 40 mg EV 1x/dia',
      'Morfina 2 mg EV se dor intensa · Cefazolina 1 g EV 8/8h · Fisioterapia motora 2x/dia',
    ]),
    dataRegistro: `${entrada}T${hhmm(minutos(i.dataEntrada.split('T')[1]) + 120)}`,
  })
  const dias = Math.min(3, Math.max(0, Math.round((new Date(fimIso).getTime() - new Date(entrada).getTime()) / 86_400_000)))
  for (let k = 1; k <= dias; k++) {
    registros.push({
      id: registros.length + 1,
      atendimento: { tipo: 'internacao', id: i.id },
      autorId: aleatorio() > 0.5 ? i.profissionalId : 8,
      tipo: aleatorio() > 0.7 ? 'EXAME' : 'EVOLUCAO',
      descricao: escolher([
        'Paciente em bom estado geral, afebril há 24h, aceitando dieta. Mantida conduta.',
        'Hemograma com leucocitose em queda (11.200). PCR em redução. Função renal preservada.',
        'Refere melhora da dispneia. SpO₂ 95% em ar ambiente. Deambulando com auxílio.',
        'Radiografia de tórax com redução do infiltrado em base direita.',
        'Dor controlada com analgesia simples. Ferida operatória limpa e seca.',
      ]),
      dataRegistro: `${somarDias(entrada, k)}T${hhmm(8 * 60 + Math.floor(aleatorio() * 4) * 60)}`,
    })
  }
})

consultas
  .filter((c) => c.status === 'REALIZADA' && aleatorio() < 0.35)
  .forEach((c) => {
    registros.push({
      id: registros.length + 1,
      atendimento: { tipo: 'consulta', id: c.id },
      autorId: c.profissionalId,
      tipo: escolher(['DIAGNOSTICO', 'PRESCRICAO', 'EXAME'] as const),
      descricao: escolher([
        'Hipertensão arterial sistêmica, estágio 1',
        'Losartana 50 mg VO 1x/dia · Retorno em 60 dias',
        'Solicitado ecocardiograma transtorácico e Holter 24h',
        'Lombalgia mecânica sem sinais de alarme',
        'Amoxicilina 500 mg VO 8/8h por 7 dias',
        'Hemograma, glicemia de jejum, perfil lipídico e TSH',
      ]),
      dataRegistro: `${c.data}T${hhmm(minutos(c.horario) + c.duracaoMinutos - 5)}`,
    })
  })
