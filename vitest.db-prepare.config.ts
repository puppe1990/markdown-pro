import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            },
        },
        test: {
            include: ['scripts/prepare-local-db.test.ts'],
            env,
        },
    };
});
