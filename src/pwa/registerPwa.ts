/** Whether the service worker should register in the current environment. */
export function canRegisterPwa(
    hasWindow: boolean,
    isProduction: boolean,
): boolean {
    return hasWindow && isProduction;
}

/** Registers the service worker on the client. No-op during SSR and dev. */
export function registerPwa(): void {
    if (!canRegisterPwa(typeof window !== 'undefined', import.meta.env.PROD)) {
        return;
    }

    void import('virtual:pwa-register').then(({ registerSW }) => {
        registerSW({ immediate: true });
    });
}
