import { createElement, ReactElement } from "react";
import { DatagridNumberFilterPreviewProps } from "../typings/DatagridNumberFilterProps";
import { FilterComponent } from "./components/FilterComponent";
import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";

export function preview(props: DatagridNumberFilterPreviewProps): ReactElement {
    return (
        <FilterComponent
            adjustable={props.adjustable}
            changeDelay={props.delay ?? 500}
            className={props.className}
            parentChannelName={null}
            defaultFilter={props.defaultFilter}
            name="NumberFilter"
            onChange={() => {}}
            placeholder={props.placeholder}
            screenReaderButtonCaption={props.screenReaderButtonCaption}
            screenReaderInputCaption={props.screenReaderInputCaption}
            styles={parseStyle(props.style)}
            value={undefined}
        />
    );
}
