import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/torneo-biliardino-dibix/', // IMPORTANTE: sostituisci con il nome del tuo repo
})
