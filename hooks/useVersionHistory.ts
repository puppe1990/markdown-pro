
import { useState, useEffect, useRef, useCallback } from 'react';
import { Version } from '../types';
import { STORAGE_KEYS } from '../constants/storage';

export const useVersionHistory = (setMarkdown: (content: string) => void) => {
    const [versions, setVersions] = useState<Version[]>([]);
    const saveTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        try {
            const savedVersions = sessionStorage.getItem(STORAGE_KEYS.markdownVersions);
            if (savedVersions) {
                const parsedVersions = JSON.parse(savedVersions);
                if (Array.isArray(parsedVersions)) {
                    setVersions(parsedVersions);
                }
            }
        } catch (error) {
            console.error('Failed to load version history:', error);
            setVersions([]);
        }
    }, []);

    const saveVersionsToLocalStorage = (newVersions: Version[]) => {
        try {
            sessionStorage.setItem(STORAGE_KEYS.markdownVersions, JSON.stringify(newVersions));
        } catch (error) {
            console.error('Failed to save version history:', error);
        }
    };

    const saveVersion = useCallback((content: string) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        
        saveTimeoutRef.current = window.setTimeout(() => {
            setVersions(prevVersions => {
                const latestVersion = prevVersions[0];
                if (latestVersion && latestVersion.content === content) {
                    return prevVersions;
                }

                const newVersion: Version = {
                    content,
                    timestamp: Date.now(),
                };

                const newVersions = [newVersion, ...prevVersions].slice(0, 50); // Limit to 50 versions
                saveVersionsToLocalStorage(newVersions);
                return newVersions;
            });
        }, 2000); // Debounce saving by 2 seconds
    }, []);

    const revertToVersion = useCallback((versionIndex: number) => {
        const versionToRevert = versions[versionIndex];
        if (versionToRevert) {
            setMarkdown(versionToRevert.content);
        }
    }, [versions, setMarkdown]);
    
    return { versions, saveVersion, revertToVersion };
};
