import { EditableValue } from "mendix";
import { SettingsStorage } from "./base";
import { GridSettings } from "../../typings/GridSettings";

export class AttrStorage implements SettingsStorage {
    constructor(private attr: EditableValue<string>, private hash: string) {}

    load(): GridSettings | undefined {
        if (typeof this.attr.value === "string" && this.attr.value.length > 0) {
            const data: GridSettings = JSON.parse(this.attr.value);
            if (data.settingsHash === this.hash) {
                return data;
            }
            this.reset();
        }
    }

    save(settings: GridSettings): void {
        this.attr.setValue(JSON.stringify(settings));
    }

    reset(): void {
        this.attr.setValue(undefined);
    }
}
