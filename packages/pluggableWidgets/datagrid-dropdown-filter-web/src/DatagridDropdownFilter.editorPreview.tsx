import { createElement, ReactElement } from "react";
import { DatagridDropdownFilterPreviewProps } from "../typings/DatagridDropdownFilterProps";
import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";
import { Select } from "@mendix/widget-plugin-filtering/controls/select/SelectComponent";

export function preview(props: DatagridDropdownFilterPreviewProps): ReactElement {
    return (
        <Select
            className={props.class}
            styles={parseStyle(props.style)}
            options={[]}
            empty={{ caption: props.emptyOptionCaption, value: "", selected: false }}
            inputValue={props.defaultValue}
            multiSelect={false}
            onSelect={() => {}}
            badge={props.groupKey ? `group: ${props.groupKey}` : undefined}
        />
    );
}
