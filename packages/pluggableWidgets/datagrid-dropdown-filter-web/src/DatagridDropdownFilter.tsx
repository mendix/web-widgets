import { createElement, ReactElement } from "react";
import { DatagridDropdownFilterContainerProps } from "../typings/DatagridDropdownFilterProps";
import { useFilterContextValue, getFilterStore } from "@mendix/widget-plugin-filtering/provider-next";
import { StaticFilterContainer } from "./components/StaticFilterContainer";
import { FilterType } from "@mendix/widget-plugin-filtering/provider";

export default function DatagridDropdownFilter(_props: DatagridDropdownFilterContainerProps): ReactElement {
    const ctx = useFilterContextValue();

    if (ctx.hasError) {
        return <div>Error</div>;
    }

    const store = getFilterStore(ctx.value, FilterType.ENUMERATION, "undefined");

    if (store === null || store.storeType === "input") {
        return <div>Store error</div>;
    }

    return <StaticFilterContainer filterStore={store} multiselect={_props.multiSelect} />;
}
