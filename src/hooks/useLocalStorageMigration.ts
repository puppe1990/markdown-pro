import { useEffect, useRef } from 'react';
import {
    useCreateTab,
    useUpdateTab,
    useTabs,
} from '@/src/features/tabs/useTabs';
import { useSaveVersion } from '@/src/features/versions/useVersions';
import { useSetTheme } from '@/src/features/preferences/usePreferences';

const MIGRATION_KEY = 'markdown-pro-migrated-v1';

export function useLocalStorageMigration() {
    const hasRun = useRef(false);
    const { data: remoteTabs } = useTabs();
    const createTab = useCreateTab();
    const updateTab = useUpdateTab();
    const saveVersion = useSaveVersion();
    const setTheme = useSetTheme();

    useEffect(() => {
        if (hasRun.current) return;
        if (typeof window === 'undefined') return;

        const alreadyMigrated = localStorage.getItem(MIGRATION_KEY);
        if (alreadyMigrated) return;

        hasRun.current = true;

        const tabsRaw =
            localStorage.getItem('markdown-tabs') ??
            localStorage.getItem('markdown-content');
        const versionsRaw = localStorage.getItem('markdown-versions');
        const activeTabIdRaw = localStorage.getItem('markdown-active-tab-id');
        const themeRaw = localStorage.getItem('theme') as
            | 'light'
            | 'dark'
            | null;

        const migrate = async () => {
            if (!remoteTabs || remoteTabs.length > 0) {
                localStorage.setItem(MIGRATION_KEY, '1');
                return;
            }

            try {
                let tabs: { id: string; name: string; content: string }[] = [];
                if (tabsRaw) {
                    const parsed = JSON.parse(tabsRaw);
                    if (Array.isArray(parsed)) tabs = parsed;
                } else {
                    tabs = [{ id: 'default', name: 'Untitled', content: '' }];
                }

                for (const tab of tabs) {
                    await createTab.mutateAsync({
                        data: { id: tab.id, name: tab.name },
                    });
                    if (tab.content) {
                        await updateTab.mutateAsync({
                            data: { id: tab.id, content: tab.content },
                        });
                    }
                }

                if (versionsRaw) {
                    const versions = JSON.parse(versionsRaw);
                    if (Array.isArray(versions)) {
                        const activeTab =
                            tabs.find((t) => t.id === activeTabIdRaw) ??
                            tabs[0];
                        if (activeTab) {
                            for (const v of versions.slice(0, 50)) {
                                await saveVersion.mutateAsync({
                                    data: {
                                        tabId: activeTab.id,
                                        content: v.content,
                                    },
                                });
                            }
                        }
                    }
                }

                if (themeRaw) {
                    await setTheme.mutateAsync({ data: { theme: themeRaw } });
                }

                localStorage.setItem(MIGRATION_KEY, '1');
                localStorage.removeItem('markdown-tabs');
                localStorage.removeItem('markdown-content');
                localStorage.removeItem('markdown-versions');
                localStorage.removeItem('markdown-active-tab-id');
                localStorage.removeItem('theme');
            } catch {
                hasRun.current = false;
            }
        };

        migrate();
    }, [remoteTabs, createTab, updateTab, saveVersion, setTheme]);
}
