import { PlainJs } from "@mendix/filter-commons/typings/settings";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { EditableValue } from "mendix";
import { computed, makeObservable } from "mobx";
import { ObservableStorage } from "src/typings/storage";

type Gate = DerivedPropsGate<{
    stateStorageAttr: EditableValue<string>;
}>;

export class AttributeStorage implements ObservableStorage, ReactiveController {
    private readonly _gate: Gate;

    constructor(host: ReactiveControllerHost, gate: Gate) {
        host.addController(this);

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
