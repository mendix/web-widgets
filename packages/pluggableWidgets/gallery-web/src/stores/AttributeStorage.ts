import { PlainJs } from "@mendix/filter-commons/typings/settings";
import { DerivedPropsGate, SetupComponent, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { EditableValue } from "mendix";
import { computed, makeObservable } from "mobx";
import { ObservableStorage } from "../typings/storage";

type Gate = DerivedPropsGate<{
    stateStorageAttr: EditableValue<string>;
}>;

export class AttributeStorage implements ObservableStorage, SetupComponent {
    private readonly _gate: Gate;

    constructor(host: SetupComponentHost, gate: Gate) {
        host.add(this);

        this._gate = gate;
        makeObservable<this, "_attribute">(this, {
            _attribute: computed,
            data: computed.struct
        });
    }

    setup(): () => void {
        return () => {};
    }

    private get _attribute(): EditableValue<string> {
        return this._gate.props.stateStorageAttr;
    }

    get data(): PlainJs {
        const jsonString = this._attribute.value;
        if (!jsonString) {
            return null;
        }
        try {
            return JSON.parse(jsonString) as PlainJs;
        } catch {
            console.warn("Invalid JSON configuration in the attribute. Resetting configuration.");
            this._attribute.setValue("");
            return null;
        }
    }

    setData(data: PlainJs): void {
        data = data === "" ? null : data;
        this._attribute.setValue(JSON.stringify(data));
    }
}
