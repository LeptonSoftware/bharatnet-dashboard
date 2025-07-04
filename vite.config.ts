import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import * as fs from 'fs'

// Plugin to create _redirects file for Netlify
function netlifyRedirectsPlugin(): Plugin {
  return {
    name: 'netlify-redirects',
    writeBundle: {
      sequential: true,
      order: 'post',
      handler({ dir }) {
        // Create _redirects file in the build output directory
        const redirectsPath = path.resolve(dir as string, '_redirects');
        const redirectsContent = '/* /index.html 200';
        fs.writeFileSync(redirectsPath, redirectsContent);
      }
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    netlifyRedirectsPlugin()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});