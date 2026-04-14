// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'read-excel-file': path.resolve(__dirname, 'node_modules/read-excel-file/bundle/read-excel-file.min.js')
    }
  }
})