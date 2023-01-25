declare global {
    interface Window {
        dataLayer: any[];
        mx: {
            ui: {
                getContentForm(): { path: string };
            };
        };
    }
    interface Document {
        mxGtag?: {
            ensureGtagIncluded: (tagId: string) => void;
            getGtag: () => (...args: any[]) => void;
        };
    }
}

export {};
