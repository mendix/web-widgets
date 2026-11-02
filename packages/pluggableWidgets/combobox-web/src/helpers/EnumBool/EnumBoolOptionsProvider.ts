import { computed, makeObservable } from "mobx";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { FilterTypeEnum } from "../../../typings/ComboboxProps";
import { BaseOptionsProvider } from "../BaseOptionsProvider";
import { CaptionsProvider } from "../types";
import { enumerationAttribute, EnumerationGateProps } from "./gate";

/** The attribute universe as option ids: enumeration keys, or "true" and "false". */
export class EnumBoolOptionsProvider extends BaseOptionsProvider {
    constructor(
        private readonly gate: DerivedPropsGate<EnumerationGateProps>,
        caption: Pick<CaptionsProvider, "get">,
        filterType: FilterTypeEnum
    ) {
        super(caption, filterType);
        makeObservable(this, { ids: computed, isBoolean: computed });
    }

    get ids(): string[] {
        return (enumerationAttribute(this.gate.props).universe ?? []).map(option => option.toString());
    }

    get isBoolean(): boolean {
        return typeof enumerationAttribute(this.gate.props).universe?.[0] === "boolean";
    }

    /** The attribute value behind an option id. */
    value(id: string | null): string | boolean | undefined {
        return this.isBoolean ? id === "true" : (id ?? undefined);
    }
}
