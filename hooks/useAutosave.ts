
import { useEffect } from 'react';
import { STORAGE_KEYS } from '../constants/storage';

export const useAutosave = (value: string, delay: number) => {
    useEffect(() => {
        const handler = setTimeout(() => {
            sessionStorage.setItem(STORAGE_KEYS.markdownContent, value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
};
