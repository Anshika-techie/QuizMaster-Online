import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // If the API is not running, show a clear message instead of an empty 500
        configure: (proxy) => {
          proxy.on('error', (_err, _req, res) => {
            if (res.writeHead && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
            }
            res.end(
              JSON.stringify({
                message: 'Backend is not running. Start it with "npm run dev" from the project root and check the terminal for errors',
              })
            );
          });
        },
      },
    },
  },
});
