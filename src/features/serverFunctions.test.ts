import { describe, expect, it } from 'vitest';

describe('server function definitions', () => {
    it('loads tabs server functions without deprecated validator API', async () => {
        const tabs = await import('./tabs/tabs.functions');
        expect(typeof tabs.getTabs).toBe('function');
        expect(typeof tabs.createTab).toBe('function');
        expect(typeof tabs.updateTab).toBe('function');
        expect(typeof tabs.deleteTab).toBe('function');
    });

    it('loads versions server functions without deprecated validator API', async () => {
        const versions = await import('./versions/versions.functions');
        expect(typeof versions.getVersions).toBe('function');
        expect(typeof versions.saveVersion).toBe('function');
    });

    it('loads preferences server functions without deprecated validator API', async () => {
        const preferences = await import('./preferences/preferences.functions');
        expect(typeof preferences.getPreferences).toBe('function');
        expect(typeof preferences.setTheme).toBe('function');
    });
});
