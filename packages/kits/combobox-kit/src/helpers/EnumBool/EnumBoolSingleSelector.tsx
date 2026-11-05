import { EditableValue } from "mendix";
import { action, computed, makeObservable } from "mobx";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { ComboboxConfig } from "../../core/Combobox.config";
import { SingleSelector, Status } from "../types";
import { EnumAndBooleanSimpleCaptionsProvider } from "./EnumAndBooleanSimpleCaptionsProvider";
import { EnumBoolOptionsProvider } from "./EnumBoolOptionsProvider";
import { enumerationAttribute, EnumerationGateProps } from "./gate";

/** A selector over an enumeration or boolean attribute: the options are its universe. */
export class EnumBooleanSingleSelector implements SingleSelector {
    readonly type = "single";
    readonly options: EnumBoolOptionsProvider;
    readonly caption: EnumAndBooleanSimpleCaptionsProvider;

    constructor(
        private readonly gate: DerivedPropsGate<EnumerationGateProps>,
        private readonly config: ComboboxConfig
    ) {
        this.caption = new EnumAndBooleanSimpleCaptionsProvider(gate);
        this.options = new EnumBoolOptionsProvider(gate, this.caption, config.filterType);
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

    private get attr(): EditableValue<string | boolean> {
        return enumerationAttribute(this.gate.props);
    }

    private get available(): boolean {
        const { emptyOptionText } = this.gate.props;
        return (
            this.attr.status !== "unavailable" &&
            emptyOptionText !== undefined &&
            emptyOptionText.status !== "unavailable"
        );
    }

    get status(): Status {
        return this.available ? this.attr.status : "unavailable";
    }

    get currentId(): string | null {
        return this.available ? (this.attr.value?.toString() ?? null) : null;
    }

    get readOnly(): boolean {
        return this.attr.readOnly;
    }

    get validation(): string | undefined {
        return this.attr.validation;
    }

    /** A boolean is never clearable: the attribute always holds a value. */
    get clearable(): boolean {
        return this.options.isBoolean ? false : this.config.clearable;
    }

    setValue(id: string | null): void {
        this.attr.setValue(this.options.value(id));
    }
}
