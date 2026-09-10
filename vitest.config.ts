import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: [
      { find: /^react-native$/, replacement: 'react-native-web' },
      { find: '@', replacement: new URL('.', import.meta.url).pathname },
    ],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./__tests__/setup.ts'],
    include: ['__tests__/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'cobertura'],
      include: ['{app,components,features,hooks,services,domain,theme,constants}/**/*.{ts,tsx}'],
    },
  },
});
