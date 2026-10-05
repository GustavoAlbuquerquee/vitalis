import { createBrowserRouter } from 'react-router'
import { Layout } from './Layout'
import { NaoEncontrada } from './NaoEncontrada'
import { Painel } from '@/modulos/painel/Painel'
import { ListaPacientes } from '@/modulos/pacientes/ListaPacientes'
import { DetalhePaciente } from '@/modulos/pacientes/DetalhePaciente'
import { FormularioPaciente } from '@/modulos/pacientes/FormularioPaciente'
import { ListaProfissionais } from '@/modulos/profissionais/ListaProfissionais'
import { DetalheProfissional } from '@/modulos/profissionais/DetalheProfissional'
import { FormularioProfissional } from '@/modulos/profissionais/FormularioProfissional'
import { Agenda } from '@/modulos/consultas/Agenda'
import { DetalheConsulta } from '@/modulos/consultas/DetalheConsulta'
import { AgendarConsulta } from '@/modulos/consultas/AgendarConsulta'
import { ListaInternacoes } from '@/modulos/internacoes/ListaInternacoes'
import { DetalheInternacao } from '@/modulos/internacoes/DetalheInternacao'
import { NovaInternacao } from '@/modulos/internacoes/NovaInternacao'
import { MapaQuartos } from '@/modulos/quartos/MapaQuartos'
import { DetalheQuarto } from '@/modulos/quartos/DetalheQuarto'
import { DesignSystem } from '@/modulos/design-system/DesignSystem'

/** Uma rota por recurso de docs/api.md, com os mesmos nomes. */
export const roteador = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Painel /> },

      { path: 'pacientes', element: <ListaPacientes /> },
      { path: 'pacientes/novo', element: <FormularioPaciente /> },
      { path: 'pacientes/:id', element: <DetalhePaciente /> },
      { path: 'pacientes/:id/editar', element: <FormularioPaciente /> },

      { path: 'profissionais', element: <ListaProfissionais /> },
      { path: 'profissionais/novo', element: <FormularioProfissional /> },
      { path: 'profissionais/:id', element: <DetalheProfissional /> },
      { path: 'profissionais/:id/editar', element: <FormularioProfissional /> },

      { path: 'consultas', element: <Agenda /> },
      { path: 'consultas/nova', element: <AgendarConsulta /> },
      { path: 'consultas/:id', element: <DetalheConsulta /> },

      { path: 'internacoes', element: <ListaInternacoes /> },
      { path: 'internacoes/nova', element: <NovaInternacao /> },
      { path: 'internacoes/:id', element: <DetalheInternacao /> },

      { path: 'quartos', element: <MapaQuartos /> },
      { path: 'quartos/:id', element: <DetalheQuarto /> },

      { path: 'design-system', element: <DesignSystem /> },
      { path: '*', element: <NaoEncontrada /> },
    ],
  },
])
