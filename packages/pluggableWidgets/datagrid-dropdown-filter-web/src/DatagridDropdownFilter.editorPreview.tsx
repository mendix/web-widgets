import { createElement, ReactElement } from "react";
import { DatagridDropdownFilterPreviewProps } from "../typings/DatagridDropdownFilterProps";
import { FilterComponent } from "./components/FilterComponent";
import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";

export function preview(props: DatagridDropdownFilterPreviewProps): ReactElement {
    return (
        <FilterComponent
            ariaLabel={props.ariaLabel}
            className={props.className}
            initialSelected={props.defaultValue}
            options={[{ caption: "optionCaption", value: "option" }]}
            styles={parseStyle(props.style)}
        />
    );
}
