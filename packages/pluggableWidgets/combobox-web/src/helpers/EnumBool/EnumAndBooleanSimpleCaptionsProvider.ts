import { computed, makeObservable } from "mobx";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { CaptionsProvider } from "../types";
import { enumerationAttribute, EnumerationGateProps } from "./gate";

/** Captions through the attribute formatter: the enumeration caption or the formatted boolean. */
export class EnumAndBooleanSimpleCaptionsProvider implements CaptionsProvider {
    constructor(private readonly gate: DerivedPropsGate<EnumerationGateProps>) {
        makeObservable(this, { emptyCaption: computed });
    }

    get emptyCaption(): string {
        const text = this.gate.props.emptyOptionText;
        return !text || text.status === "unavailable" ? "" : (text.value ?? "");
    }

    get(id: string | null): string {
        if (id === null) {
            return this.emptyCaption;
        }
        const attribute = enumerationAttribute(this.gate.props);
        const value = typeof attribute.universe?.[0] === "boolean" ? id === "true" : id;
        return attribute.formatter.format(value) ?? "";
    }

    /** Enumerations and booleans have no custom content. */
    customContent(): undefined {
        return undefined;
    }
}
