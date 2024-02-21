import { createElement, ReactElement } from "react";
import { DatagridTextFilterPreviewProps } from "../typings/DatagridTextFilterProps";
import { FilterComponent } from "./components/FilterComponent";
import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";

export function preview(props: DatagridTextFilterPreviewProps): ReactElement {
    return (
        <FilterComponent
            adjustable={props.adjustable}
            className={props.className}
            defaultFilter={props.defaultFilter}
            changeDelay={props.delay ?? 500}
            placeholder={props.placeholder}
            screenReaderButtonCaption={props.screenReaderButtonCaption}
            screenReaderInputCaption={props.screenReaderInputCaption}
            styles={parseStyle(props.style)}
            value={props.defaultValue}
            onChange={() => {}}
            parentChannelName={null}
            name="TextFilter"
        />
    );
}
