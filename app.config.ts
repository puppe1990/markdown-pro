import { createApp } from 'vinxi';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';

export default createApp({
    routers: tanstackStart({ appDirectory: 'src/app' }),
});
