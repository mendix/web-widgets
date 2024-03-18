import { EditableValue, ValueStatus } from "mendix";
import { PersonalizationStorage } from "./PersonalizationStorage";
import { GridPersonalizationStorageSettings } from "../../typings/personalization-settings";
import { action, computed, makeObservable, observable } from "mobx";
import { DatagridContainerProps } from "../../../typings/DatagridProps";

export class AttributePersonalizationStorage implements PersonalizationStorage {
    private storageAttr: EditableValue<string> | undefined;

    constructor(props: DatagridContainerProps) {
        this.storageAttr = props.configurationAttribute;

        makeObservable<this, "storageAttr">(this, {
            storageAttr: observable.ref,

            settings: computed.struct,

            updateProps: action
        });
    }

    updateProps(props: DatagridContainerProps): void {
        this.storageAttr = props.configurationAttribute;
    }

    get settings(): GridPersonalizationStorageSettings | undefined {
        if (this.storageAttr && this.storageAttr.status === ValueStatus.Available && this.storageAttr.value) {
            return JSON.parse(this.storageAttr.value) as GridPersonalizationStorageSettings;
        }
    }

    updateSettings(newSettings: GridPersonalizationStorageSettings): void {
        if (this.storageAttr && !this.storageAttr.readOnly) {
            const newSettingsJson = JSON.stringify(newSettings);
            if (this.storageAttr.value !== newSettingsJson) {
                this.storageAttr.setValue(newSettingsJson);
            }
        }
    }
}
