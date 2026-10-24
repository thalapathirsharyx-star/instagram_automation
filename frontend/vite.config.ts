import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isDev = mode === 'development'

  // Where the NestJS backend is listening during local development.
  const backendTarget = env.DEV_BACKEND_URL || 'http://localhost:8001'

  return {
    plugins: [
      react(),
      tailwindcss(),
      // Facebook Login refuses to run its OAuth dialog when the page that opened it is
      // not served over HTTPS ("Facebook has detected ... isn't using a secure connection
      // to transfer information"). Serving the dev server over TLS is therefore required
      // to test the Meta integration locally. The certificate is self-signed, so the
      // browser shows a one-time warning you accept.
      ...(isDev ? [basicSsl()] : [])
    ],
    server: {
      port: 5173,
      // The API is proxied rather than called directly on http://localhost:8001, because
      // an HTTPS page calling an HTTP origin is blocked as mixed content. Proxying keeps
      // every request same-origin over HTTPS; Vite forwards it to the backend over HTTP.
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false
        },
        '/socket.io': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          ws: true
        }
      }
    }
  }
})
