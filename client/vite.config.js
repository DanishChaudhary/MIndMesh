import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: undefined
            }
        }
    },
    server: {
        port: 5173,
        proxy: {
            '/api': 'http://localhost:5000',
            '/data': 'http://localhost:5000'
        }
    }
})
