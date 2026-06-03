import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '.'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        include: ['**/*.test.{ts,tsx}'],
        env: {
            TURSO_DATABASE_URL: 'libsql://test.turso.io',
            TURSO_AUTH_TOKEN: 'test-token',
            BETTER_AUTH_URL: 'http://localhost:3000',
            BETTER_AUTH_SECRET: 'test-secret-key-at-least-32-chars',
        },
    },
});
