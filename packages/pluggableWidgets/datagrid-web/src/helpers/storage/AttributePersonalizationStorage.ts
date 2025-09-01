import { EditableValue, ValueStatus } from "mendix";
import { action, computed, makeObservable, observable } from "mobx";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { PersonalizationStorage } from "./PersonalizationStorage";

type RequiredProps = Pick<DatagridContainerProps, "configurationAttribute">;

/**
 * AttributePersonalizationStorage is a class that implements PersonalizationStorage
 * and uses an editable value to store the personalization settings in a Mendix attribute.
 */
export class AttributePersonalizationStorage implements PersonalizationStorage {
    private _storageAttr: EditableValue<string> | undefined;

    constructor(props: RequiredProps) {
        this._storageAttr = props.configurationAttribute;

        makeObservable<this, "_storageAttr" | "_value">(this, {
            _storageAttr: observable.ref,
            _value: computed,
            settings: computed.struct,
            updateProps: action
        });
    }

    updateProps(props: RequiredProps): void {
        this._storageAttr = props.configurationAttribute;
    }

    get _value(): string | undefined {
        if (this._storageAttr && this._storageAttr.status === ValueStatus.Available) {
            return this._storageAttr.value;
        }
    }

    get settings(): unknown {
        if (this._value) {
            return JSON.parse(this._value) as unknown;
        }
    }

    updateSettings(newSettings: any): void {
        // Prevent saving empty string or null to the attribute
        newSettings = newSettings === "" || newSettings === null ? undefined : newSettings;
        if (this._storageAttr && !this._storageAttr.readOnly) {
            const newSettingsJson = JSON.stringify(newSettings);
            if (this._storageAttr.value !== newSettingsJson) {
                this._storageAttr.setValue(newSettingsJson);
            }
        }
    }
}
