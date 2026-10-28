import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';

export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd(), '');
  const PORT = '4001';

  return {
    server: {
      open: true,
      host: '0.0.0.0',
      port: PORT
    },

    define: {
      global: 'window'
    },

    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : []
    },

    resolve: {
      alias: [
        // { find: '', replacement: path.resolve(__dirname, 'src') },
        // {
        //   find: /^~(.+)/,
        //   replacement: path.join(process.cwd(), 'node_modules/$1')
        // },
        // {
        //   find: /^src(.+)/,
        //   replacement: path.join(process.cwd(), 'src/$1')
        // },
        // {
        //   find: 'assets',
        //   replacement: path.join(process.cwd(), 'src/assets')
        // },
      ]
    },

    css: {
      preprocessorOptions: {
        scss: {
          charset: false,
          api: 'modern',
          silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-functions'],
          quietDeps: true
        },
        less: {
          charset: false
        }
      },

      charset: false,

      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove();
                }
              }
            }
          }
        ]
      }
    },

    base: '/realestate/',

    build: {
      chunkSizeWarningLimit: 2500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('xlsx')) {
                return 'vendor-xlsx';
              }
              if (id.includes('docx') || id.includes('mammoth') || id.includes('pizzip')) {
                return 'vendor-docx';
              }
              if (id.includes('jspdf')) {
                return 'vendor-jspdf';
              }
              if (id.includes('html2canvas') || id.includes('html2pdf')) {
                return 'vendor-html2canvas';
              }
              if (id.includes('react-bootstrap') || id.includes('@restart')) {
                return 'vendor-react-bootstrap';
              }
            }
          }
        }
      }
    },

    plugins: [react(), jsconfigPaths()]
  };
});