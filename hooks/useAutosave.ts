import { useEffect } from 'react';

export const useAutosave = (value: string, delay: number) => {
    useEffect(() => {
        const handler = setTimeout(() => {
            localStorage.setItem('markdown-content', value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
};
