import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['__tests__/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'cobertura'],
      include: ['{app,components,features,hooks,services,domain,theme,constants}/**/*.{ts,tsx}'],
    },
  },
});
