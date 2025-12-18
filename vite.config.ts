import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@server': resolve(__dirname, './src/server'),
      '@widgets': resolve(__dirname, './src/widgets'),
      '@shared': resolve(__dirname, './src/shared'),
    },
  },
  build: {
    outDir: 'assets',
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
  },
});
