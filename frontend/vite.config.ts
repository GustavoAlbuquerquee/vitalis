import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // O build "artefato" é publicado num caminho qualquer: assets com caminho relativo
  base: mode === 'artefato' ? './' : '/',
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  css: {
    modules: {
      // Classes legíveis no DevTools durante o desenvolvimento: Botao_primario_x7f3a
      generateScopedName: mode === 'development' ? '[name]_[local]_[hash:base64:5]' : '[hash:base64:6]',
    },
  },
}))
