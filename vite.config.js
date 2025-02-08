import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './', // Set the root directory
  base: '/', // Base public path when served in production
  server: {
    port: 3000,
    open: true, // Open browser on server start
    cors: true, // Enable CORS
    proxy: {
      '/api': {
        target: 'https://api.content.tripadvisor.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        headers: {
          'Accept': 'application/json',
          'X-TripAdvisor-API-Key': '3A0C6D6B302F48C5B8F4C6D467C03052'
        }
      },
      '/airport': {
        target: 'https://airport-info.p.rapidapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/airport/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        itinerary: resolve(__dirname, 'itinerary.html')
      },
      output: {
        manualChunks: {
          'vendor': ['booking-api.js'],
          'app': ['app.js'],
          'itinerary': ['itinerary.js']
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          if (/\.(png|jpe?g|gif|svg|webp)$/.test(assetInfo.name)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/\.(css)$/.test(assetInfo.name)) {
            return `assets/styles/[name]-[hash][extname]`;
          }
          if (/\.(js)$/.test(assetInfo.name)) {
            return `assets/js/[name]-[hash][extname]`;
          }
          return `assets/other/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  optimizeDeps: {
    include: ['date-fns']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@assets': resolve(__dirname, './assets'),
      '@styles': resolve(__dirname, './styles'),
      '@js': resolve(__dirname, './js')
    }
  },
  publicDir: 'public',
  css: {
    modules: false,
    preprocessorOptions: {
      css: {
        charset: false
      }
    },
    devSourcemap: true
  }
});
