import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    // In Docker, file changes are often synced (not native inotify), so use polling
    watch: {
      usePolling: true,
      interval: 200,
    },
  },
})
