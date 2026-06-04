import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '.'),
            'virtual:pwa-register': path.resolve(
                __dirname,
                'src/pwa/pwaRegisterStub.ts',
            ),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        include: ['**/*.test.{ts,tsx}'],
        env: {
            DATABASE_URL: 'file::memory:',
            BETTER_AUTH_URL: 'http://localhost:3000',
            BETTER_AUTH_SECRET: 'test-secret-key-at-least-32-chars',
        },
    },
});
