import { defineConfig } from '@tanstack/react-start/config';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    tsr: {
        appDirectory: 'src/app',
    },
    vite: {
        plugins: [tsConfigPaths()],
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
    },
});
