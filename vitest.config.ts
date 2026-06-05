import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    root: __dirname,
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
        include: [
            'src/**/*.test.{ts,tsx}',
            'components/**/*.test.{ts,tsx}',
            'hooks/**/*.test.{ts,tsx}',
            'services/**/*.test.{ts,tsx}',
            'app/**/*.test.{ts,tsx}',
        ],
        exclude: ['node_modules/**', 'dist/**', '.worktrees/**', 'scripts/**'],
        env: {
            DATABASE_URL: 'file::memory:',
            BETTER_AUTH_URL: 'http://localhost:3000',
            BETTER_AUTH_SECRET: 'test-secret-key-at-least-32-chars',
        },
    },
});
