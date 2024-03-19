import { EditableValue, ValueStatus } from "mendix";
import { PersonalizationStorage } from "./PersonalizationStorage";
import { GridPersonalizationStorageSettings } from "../../typings/personalization-settings";
import { action, computed, makeObservable, observable } from "mobx";
import { DatagridContainerProps } from "../../../typings/DatagridProps";

export class AttributePersonalizationStorage implements PersonalizationStorage {
    private _storageAttr: EditableValue<string> | undefined;

    constructor(props: Pick<DatagridContainerProps, "configurationAttribute">) {
        this._storageAttr = props.configurationAttribute;

        makeObservable<this, "_storageAttr">(this, {
            _storageAttr: observable.ref,

            settings: computed.struct,

            updateProps: action
        });
    }

    updateProps(props: Pick<DatagridContainerProps, "configurationAttribute">): void {
        this._storageAttr = props.configurationAttribute;
    }

    get settings(): GridPersonalizationStorageSettings | undefined {
        if (this._storageAttr && this._storageAttr.status === ValueStatus.Available && this._storageAttr.value) {
            return JSON.parse(this._storageAttr.value) as GridPersonalizationStorageSettings;
        }
    }

    updateSettings(newSettings: GridPersonalizationStorageSettings): void {
        if (this._storageAttr && !this._storageAttr.readOnly) {
            const newSettingsJson = JSON.stringify(newSettings);
            if (this._storageAttr.value !== newSettingsJson) {
                this._storageAttr.setValue(newSettingsJson);
            }
        }
    }
}
