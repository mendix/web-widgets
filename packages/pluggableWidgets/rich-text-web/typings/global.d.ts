
interface session {
    getConfig(value: string): string;
}

export interface MXGlobalObject {
    remoteUrl: string;
    session: session;
}

declare global {
    interface Window {
        mx: MXGlobalObject;
    }
}
