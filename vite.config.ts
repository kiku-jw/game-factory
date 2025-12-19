import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const isLibrary = mode === 'library';

  return {
    base: '/game-factory/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@server': resolve(__dirname, './src/server'),
        '@widgets': resolve(__dirname, './src/widgets'),
        '@shared': resolve(__dirname, './src/shared'),
      },
    },
    // Define process.env for client-side use of API keys if needed
    define: {
      'process.env': {},
    },
    build: isLibrary
      ? {
        outDir: 'dist/widgets',
        lib: {
          entry: resolve(__dirname, 'src/widgets/index.ts'),
          name: 'GameFactoryWidgets',
          formats: ['es'],
          fileName: 'widgets',
        },
        rollupOptions: {
          external: ['react', 'react-dom'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
            },
          },
        },
      }
      : {
        outDir: 'dist', // SPA build to root dist for GitHub Pages
        rollupOptions: {
          input: {
            main: resolve(__dirname, 'index.html'),
          },
        },
      },
  };
});
