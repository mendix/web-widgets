import { PlainJs } from "@mendix/filter-commons/typings/settings";
import { ObservableStorage } from "src/typings/storage";

export class BrowserStorage implements ObservableStorage {
    constructor(private readonly _storageKey: string) {}

    get data(): PlainJs {
        try {
            return JSON.parse(localStorage.getItem(this._storageKey) ?? "null");
        } catch {
            return null;
        }
    }

    setData(data: PlainJs): void {
        localStorage.setItem(this._storageKey, JSON.stringify(data));
    }
}
