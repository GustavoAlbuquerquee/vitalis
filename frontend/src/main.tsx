import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { ProvedorAvisos } from '@/ds'
import { roteador } from '@/app/rotas'
import '@/estilos/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProvedorAvisos>
      <RouterProvider router={roteador} />
    </ProvedorAvisos>
  </StrictMode>,
)
