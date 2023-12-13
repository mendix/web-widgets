import { LocalSettingsStorage } from "./LocalSettingsStorage";

const NS = "com.mendix.widgets.web.datagrid.storageKeys";

declare global {
    interface Window {
        [NS]: Set<string> | undefined;
    }
}

function getSharedKeySet(): Set<string> {
    if (window[NS]) {
        return window[NS];
    }

    window[NS] = new Set();

    return window[NS];
}

export function requestLocalStorage(key: string): LocalSettingsStorage | undefined {
    const keys = getSharedKeySet();

    if (keys.has(key)) {
        console.warn(`The storage with key ${key} is already in use. Grid settings will not be stored.`);
        return;
    }

    keys.add(key);

    return new LocalSettingsStorage(key);
}
