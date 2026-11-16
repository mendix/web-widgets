import { Big } from "big.js";
import { EditableValue } from "mendix";
import { action, computed, makeObservable } from "mobx";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { ComboboxConfig } from "../../core/Combobox.config";
import { OptionsSourceStaticDataSourceType } from "../../typings/ComboboxProps";
import { SingleSelector, Status } from "../types";
import { _valuesIsEqual } from "../utils";
import { StaticGateProps } from "./gate";
import { StaticCaptionsProvider } from "./StaticCaptionsProvider";
import { StaticOptionsProvider } from "./StaticOptionsProvider";

/** A selector over a list of entries configured in Studio Pro; the option ids are the entry indices. */
export class StaticSingleSelector implements SingleSelector {
    readonly type = "single";
    readonly options: StaticOptionsProvider;
    readonly caption: StaticCaptionsProvider;

    constructor(
        private readonly gate: DerivedPropsGate<StaticGateProps>,
        private readonly config: ComboboxConfig
    ) {
        this.caption = new StaticCaptionsProvider(gate, config.customContentType);
        this.options = new StaticOptionsProvider(gate, this.caption, config.filterType);
        makeObservable<this, "available">(this, {
            available: computed,
            status: computed,
            currentId: computed,
            readOnly: computed,
            validation: computed,
            clearable: computed,
            setValue: action
        });
    }

    private get attr(): EditableValue<string | Big | boolean | Date> {
        return this.gate.props.staticAttribute;
    }

    private get entries(): OptionsSourceStaticDataSourceType[] {
        return this.gate.props.optionsSourceStaticDataSource;
    }

    /** The first entry stands for the list: its value and caption must have resolved. */
    private get available(): boolean {
        const { emptyOptionText } = this.gate.props;
        const [first] = this.entries;
        return (
            this.attr.status !== "unavailable" &&
            first?.staticDataSourceValue.status !== "unavailable" &&
            first?.staticDataSourceCaption.status !== "unavailable" &&
            emptyOptionText !== undefined &&
            emptyOptionText.status !== "unavailable"
        );
    }

    get status(): Status {
        return this.available ? this.attr.status : "unavailable";
    }

    /** The index of the entry whose value equals the attribute's. */
    get currentId(): string | null {
        const { value } = this.attr;
        if (!this.available || value === undefined || value === "") {
            return null;
        }
        const index = this.entries.findIndex(
            entry =>
                entry.staticDataSourceValue.status === "available" &&
                _valuesIsEqual(entry.staticDataSourceValue.value, value)
        );
        return index === -1 ? null : index.toString();
    }

    get readOnly(): boolean {
        return this.attr.readOnly;
    }

    get validation(): string | undefined {
        return this.attr.validation;
    }

    get clearable(): boolean {
        return this.available && typeof this.attr.value !== "boolean" && this.config.clearable;
    }

    setValue(id: string | null): void {
        this.attr.setValue(this.options.entry(id)?.staticDataSourceValue.value);
    }
}
