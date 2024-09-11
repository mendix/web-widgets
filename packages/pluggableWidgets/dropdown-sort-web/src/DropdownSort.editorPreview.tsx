import { createElement, ReactElement } from "react";
import { SortComponent } from "./components/SortComponent";
import { DropdownSortPreviewProps } from "../typings/DropdownSortProps";
import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";

export function preview(props: DropdownSortPreviewProps): ReactElement {
    return (
        <SortComponent
            value={null}
            direction="asc"
            className={props.className}
            placeholder={props.emptyOptionCaption}
            options={[{ caption: "optionCaption", value: "option" }]}
            screenReaderButtonCaption={props.screenReaderButtonCaption}
            screenReaderInputCaption={props.screenReaderInputCaption}
            styles={parseStyle(props.style)}
        />
    );
}
