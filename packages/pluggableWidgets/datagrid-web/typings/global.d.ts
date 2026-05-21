interface MXSessionLocale {
    patterns: {
        date: string;
        datetime: string;
        time: string;
    };
}

interface MXGlobalObject {
    session: {
        getConfig(): { locale: MXSessionLocale };
    };
}

declare global {
    interface Window {
        mx?: MXGlobalObject;
    }
}

export {};
