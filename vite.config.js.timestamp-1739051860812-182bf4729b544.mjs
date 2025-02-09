// vite.config.js
import { defineConfig, loadEnv } from "file:///C:/Users/USER/Desktop/project/node_modules/vite/dist/node/index.js";
import { resolve } from "path";
var __vite_injected_original_dirname = "C:\\Users\\USER\\Desktop\\project";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    root: "./",
    // Set the root directory
    base: "/",
    // Base public path when served in production
    server: {
      port: 3e3,
      open: true,
      // Open browser on server start
      cors: true,
      // Enable CORS
      proxy: {
        "/api": {
          target: "https://api.content.tripadvisor.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
          headers: {
            "Accept": "application/json",
            "X-TripAdvisor-API-Key": env.VITE_TRIPADVISOR_API_KEY
          }
        },
        "/amadeus": {
          target: "https://test.api.amadeus.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/amadeus/, ""),
          configure: (proxy, _options) => {
            proxy.on("proxyReq", (proxyReq, req, _res) => {
              if (req.body) {
                const bodyData = JSON.stringify(req.body);
                proxyReq.setHeader("Content-Type", "application/json");
                proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
              }
            });
          }
        },
        "/airport": {
          target: "https://airport-info.p.rapidapi.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/airport/, ""),
          headers: {
            "x-rapidapi-key": env.VITE_RAPIDAPI_KEY,
            "x-rapidapi-host": "airport-info.p.rapidapi.com"
          }
        }
      }
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: true,
      rollupOptions: {
        input: {
          main: resolve(__vite_injected_original_dirname, "index.html"),
          itinerary: resolve(__vite_injected_original_dirname, "itinerary.html")
        },
        output: {
          manualChunks: {
            "vendor": ["booking-api.js"],
            "app": ["app.js"],
            "itinerary": ["itinerary.js"]
          },
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split(".");
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
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js"
        }
      },
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    },
    optimizeDeps: {
      include: ["date-fns"]
    },
    resolve: {
      alias: {
        "@": resolve(__vite_injected_original_dirname, "./src"),
        "@assets": resolve(__vite_injected_original_dirname, "./assets"),
        "@styles": resolve(__vite_injected_original_dirname, "./styles"),
        "@js": resolve(__vite_injected_original_dirname, "./js"),
        "@data": resolve(__vite_injected_original_dirname, "./data")
      }
    },
    publicDir: "public",
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
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxVU0VSXFxcXERlc2t0b3BcXFxccHJvamVjdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcVVNFUlxcXFxEZXNrdG9wXFxcXHByb2plY3RcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL1VTRVIvRGVza3RvcC9wcm9qZWN0L3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJyk7XG4gIFxuICByZXR1cm4ge1xuICAgIHJvb3Q6ICcuLycsIC8vIFNldCB0aGUgcm9vdCBkaXJlY3RvcnlcbiAgICBiYXNlOiAnLycsIC8vIEJhc2UgcHVibGljIHBhdGggd2hlbiBzZXJ2ZWQgaW4gcHJvZHVjdGlvblxuICAgIHNlcnZlcjoge1xuICAgICAgcG9ydDogMzAwMCxcbiAgICAgIG9wZW46IHRydWUsIC8vIE9wZW4gYnJvd3NlciBvbiBzZXJ2ZXIgc3RhcnRcbiAgICAgIGNvcnM6IHRydWUsIC8vIEVuYWJsZSBDT1JTXG4gICAgICBwcm94eToge1xuICAgICAgICAnL2FwaSc6IHtcbiAgICAgICAgICB0YXJnZXQ6ICdodHRwczovL2FwaS5jb250ZW50LnRyaXBhZHZpc29yLmNvbScsXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGkvLCAnJyksXG4gICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICdYLVRyaXBBZHZpc29yLUFQSS1LZXknOiBlbnYuVklURV9UUklQQURWSVNPUl9BUElfS0VZXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAnL2FtYWRldXMnOiB7XG4gICAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly90ZXN0LmFwaS5hbWFkZXVzLmNvbScsXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hbWFkZXVzLywgJycpLFxuICAgICAgICAgIGNvbmZpZ3VyZTogKHByb3h5LCBfb3B0aW9ucykgPT4ge1xuICAgICAgICAgICAgcHJveHkub24oJ3Byb3h5UmVxJywgKHByb3h5UmVxLCByZXEsIF9yZXMpID0+IHtcbiAgICAgICAgICAgICAgaWYgKHJlcS5ib2R5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYm9keURhdGEgPSBKU09OLnN0cmluZ2lmeShyZXEuYm9keSk7XG4gICAgICAgICAgICAgICAgcHJveHlSZXEuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgICAgIHByb3h5UmVxLnNldEhlYWRlcignQ29udGVudC1MZW5ndGgnLCBCdWZmZXIuYnl0ZUxlbmd0aChib2R5RGF0YSkpO1xuICAgICAgICAgICAgICAgIHByb3h5UmVxLndyaXRlKGJvZHlEYXRhKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAnL2FpcnBvcnQnOiB7XG4gICAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly9haXJwb3J0LWluZm8ucC5yYXBpZGFwaS5jb20nLFxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYWlycG9ydC8sICcnKSxcbiAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAneC1yYXBpZGFwaS1rZXknOiBlbnYuVklURV9SQVBJREFQSV9LRVksXG4gICAgICAgICAgICAneC1yYXBpZGFwaS1ob3N0JzogJ2FpcnBvcnQtaW5mby5wLnJhcGlkYXBpLmNvbSdcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICBvdXREaXI6ICdkaXN0JyxcbiAgICAgIGFzc2V0c0RpcjogJ2Fzc2V0cycsXG4gICAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIGlucHV0OiB7XG4gICAgICAgICAgbWFpbjogcmVzb2x2ZShfX2Rpcm5hbWUsICdpbmRleC5odG1sJyksXG4gICAgICAgICAgaXRpbmVyYXJ5OiByZXNvbHZlKF9fZGlybmFtZSwgJ2l0aW5lcmFyeS5odG1sJylcbiAgICAgICAgfSxcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgICAndmVuZG9yJzogWydib29raW5nLWFwaS5qcyddLFxuICAgICAgICAgICAgJ2FwcCc6IFsnYXBwLmpzJ10sXG4gICAgICAgICAgICAnaXRpbmVyYXJ5JzogWydpdGluZXJhcnkuanMnXVxuICAgICAgICAgIH0sXG4gICAgICAgICAgYXNzZXRGaWxlTmFtZXM6IChhc3NldEluZm8pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGluZm8gPSBhc3NldEluZm8ubmFtZS5zcGxpdCgnLicpO1xuICAgICAgICAgICAgY29uc3QgZXh0VHlwZSA9IGluZm9baW5mby5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIGlmICgvXFwuKHBuZ3xqcGU/Z3xnaWZ8c3ZnfHdlYnApJC8udGVzdChhc3NldEluZm8ubmFtZSkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGBhc3NldHMvaW1hZ2VzL1tuYW1lXVtleHRuYW1lXWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoL1xcLihjc3MpJC8udGVzdChhc3NldEluZm8ubmFtZSkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGBhc3NldHMvc3R5bGVzL1tuYW1lXS1baGFzaF1bZXh0bmFtZV1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKC9cXC4oanMpJC8udGVzdChhc3NldEluZm8ubmFtZSkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGBhc3NldHMvanMvW25hbWVdLVtoYXNoXVtleHRuYW1lXWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYGFzc2V0cy9vdGhlci9bbmFtZV0tW2hhc2hdW2V4dG5hbWVdYDtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiAnYXNzZXRzL2pzL1tuYW1lXS1baGFzaF0uanMnLFxuICAgICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnYXNzZXRzL2pzL1tuYW1lXS1baGFzaF0uanMnXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBtaW5pZnk6ICd0ZXJzZXInLFxuICAgICAgdGVyc2VyT3B0aW9uczoge1xuICAgICAgICBjb21wcmVzczoge1xuICAgICAgICAgIGRyb3BfY29uc29sZTogdHJ1ZSxcbiAgICAgICAgICBkcm9wX2RlYnVnZ2VyOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgaW5jbHVkZTogWydkYXRlLWZucyddXG4gICAgfSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICAnQCc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcbiAgICAgICAgJ0Bhc3NldHMnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vYXNzZXRzJyksXG4gICAgICAgICdAc3R5bGVzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3N0eWxlcycpLFxuICAgICAgICAnQGpzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL2pzJyksXG4gICAgICAgICdAZGF0YSc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9kYXRhJylcbiAgICAgIH1cbiAgICB9LFxuICAgIHB1YmxpY0RpcjogJ3B1YmxpYycsXG4gICAgY3NzOiB7XG4gICAgICBtb2R1bGVzOiBmYWxzZSxcbiAgICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgICAgY3NzOiB7XG4gICAgICAgICAgY2hhcnNldDogZmFsc2VcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGRldlNvdXJjZW1hcDogdHJ1ZVxuICAgIH1cbiAgfTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFtUixTQUFTLGNBQWMsZUFBZTtBQUN6VCxTQUFTLGVBQWU7QUFEeEIsSUFBTSxtQ0FBbUM7QUFHekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBRTNDLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQTtBQUFBLElBQ04sTUFBTTtBQUFBO0FBQUEsSUFDTixRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUE7QUFBQSxNQUNOLE1BQU07QUFBQTtBQUFBLE1BQ04sT0FBTztBQUFBLFFBQ0wsUUFBUTtBQUFBLFVBQ04sUUFBUTtBQUFBLFVBQ1IsY0FBYztBQUFBLFVBQ2QsU0FBUyxDQUFDLFNBQVMsS0FBSyxRQUFRLFVBQVUsRUFBRTtBQUFBLFVBQzVDLFNBQVM7QUFBQSxZQUNQLFVBQVU7QUFBQSxZQUNWLHlCQUF5QixJQUFJO0FBQUEsVUFDL0I7QUFBQSxRQUNGO0FBQUEsUUFDQSxZQUFZO0FBQUEsVUFDVixRQUFRO0FBQUEsVUFDUixjQUFj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
