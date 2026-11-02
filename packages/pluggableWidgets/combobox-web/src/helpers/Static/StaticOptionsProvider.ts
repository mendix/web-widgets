import { computed, makeObservable } from "mobx";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { FilterTypeEnum, OptionsSourceStaticDataSourceType } from "../../../typings/ComboboxProps";
import { BaseOptionsProvider } from "../BaseOptionsProvider";
import { CaptionsProvider } from "../types";
import { StaticGateProps } from "./gate";

/** The entry indices as option ids, listed in Studio Pro order even while filtering. */
export class StaticOptionsProvider extends BaseOptionsProvider {
    protected readonly keepSourceOrder = true;

    constructor(
        private readonly gate: DerivedPropsGate<Pick<StaticGateProps, "optionsSourceStaticDataSource">>,
        caption: Pick<CaptionsProvider, "get">,
        filterType: FilterTypeEnum
    ) {
        super(caption, filterType);
        makeObservable(this, { ids: computed });
    }

    get ids(): string[] {
        return this.gate.props.optionsSourceStaticDataSource.map((_, index) => index.toString());
    }

    entry(id: string | null): OptionsSourceStaticDataSourceType | undefined {
        return id === null ? undefined : this.gate.props.optionsSourceStaticDataSource[Number(id)];
    }
}
