import { LocalSettingsStorage } from "./LocalSettingsStorage";

const namespace = "com.mendix.widgets.web.datagrid.storageKeys";

declare global {
    interface Window {
        [namespace]: Set<string> | undefined;
    }
}

function getSharedKeySet(): Set<string> {
    return (window[namespace] ??= new Set());
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

export function returnStorage(key: string): boolean {
    return getSharedKeySet().delete(key);
}
