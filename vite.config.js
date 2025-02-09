import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
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
            'X-TripAdvisor-API-Key': env.VITE_TRIPADVISOR_API_KEY
          }
        },
        '/amadeus': {
          target: 'https://test.api.amadeus.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/amadeus/, ''),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              if (req.body) {
                const bodyData = JSON.stringify(req.body);
                proxyReq.setHeader('Content-Type', 'application/json');
                proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
              }
            });
          }
        },
        '/airport': {
          target: 'https://airport-info.p.rapidapi.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/airport/, ''),
          headers: {
            'x-rapidapi-key': env.VITE_RAPIDAPI_KEY,
            'x-rapidapi-host': 'airport-info.p.rapidapi.com'
          }
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
          itinerary: resolve(__dirname, 'itinerary.html'),
          flights: resolve(__dirname, 'flights.html'),
          attractions: resolve(__dirname, 'attractions.html'),
          bookings: resolve(__dirname, 'bookings.html')
        },
        output: {
          manualChunks: {
            vendor: ['./booking-api.js'],
            app: ['./app.js'],
            utils: ['./js/utils.js'],
          },
          external: [
            'https://maps.googleapis.com/maps/api/js'
          ],
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const extType = info[info.length - 1];
            if (/\.(png|jpe?g|gif|svg|webp)$/.test(assetInfo.name)) {
              return `assets/images/[name][extname]`;
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
      include: [
        'date-fns',
        '@googlemaps/js-api-loader'
      ]
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@assets': resolve(__dirname, './assets'),
        '@styles': resolve(__dirname, './styles'),
        '@js': resolve(__dirname, './js'),
        '@data': resolve(__dirname, './data'),
        '@components': resolve(__dirname, './components')
      }
    },
    define: {
      'process.env.GOOGLE_MAPS_API_KEY': JSON.stringify(process.env.GOOGLE_MAPS_API_KEY)
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
  };
});
