import { describe, expect, it, vi } from 'vitest';
import { canRegisterPwa, registerPwa } from './registerPwa';
import * as pwaRegister from 'virtual:pwa-register';

describe('canRegisterPwa', () => {
    it('returns false without a browser window', () => {
        expect(canRegisterPwa(false, true)).toBe(false);
    });

    it('returns false outside production', () => {
        expect(canRegisterPwa(true, false)).toBe(false);
    });

    it('returns true in production with a browser window', () => {
        expect(canRegisterPwa(true, true)).toBe(true);
    });
});

describe('registerPwa', () => {
    it('does nothing during SSR', () => {
        const registerSW = vi.spyOn(pwaRegister, 'registerSW');

        expect(() => registerPwa()).not.toThrow();
        expect(registerSW).not.toHaveBeenCalled();
    });
});
