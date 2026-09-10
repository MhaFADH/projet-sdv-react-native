import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

process.env.EXPO_PUBLIC_API_URL ??= 'http://localhost:3000';

afterEach(() => cleanup());
