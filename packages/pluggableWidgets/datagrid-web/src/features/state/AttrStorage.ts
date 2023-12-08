import { EditableValue } from "mendix";
import { SettingsStorage } from "../../typings/SettingsStorage";
import { GridSettings } from "../../typings/GridSettings";

export class AttrStorage implements SettingsStorage {
    constructor(private attr: EditableValue<string>) {}

    load(): GridSettings | undefined {
        if (typeof this.attr.value === "string" && this.attr.value.length > 0) {
            return JSON.parse(this.attr.value);
        }
    }

    save(settings: GridSettings): void {
        this.attr.setValue(JSON.stringify(settings, null, 2));
    }
}
