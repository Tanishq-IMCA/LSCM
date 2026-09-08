import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true, // Fail if port 3000 is taken
    host: '0.0.0.0', // EXPOSES SERVER TO LOCAL NETWORK
  }
})
