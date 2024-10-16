type DojoConnectHandle = string & {__dojo__: string};

declare global {
    interface Window {
        dataLayer: any[];
        mx: {
            ui: {
                getContentForm(): { path: string; url: string; title: string };
            };
            session: {
                getSessionObjectId(): string,
                getConfig() : { locale: { code: string } },
                getUserId(): string
            }
        };
        dojo: {
            connect: (o: object, f: string, cb: () => void) => DojoConnectHandle;
            disconnect: (DojoConnectHandle) => void;
        }
    }
    interface Document {
        mxGtag?: {
            ensureGtagIncluded: (tagId: string) => boolean;
            getGtag: () => (...args: any[]) => void;
        };
    }
}

export {};
