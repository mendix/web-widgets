import { enableStaticRendering } from "mobx-react-lite";
import { createElement, ReactElement } from "react";
import { DatagridDropdownFilterPreviewProps } from "../typings/DatagridDropdownFilterProps";
import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";
import { Select } from "@mendix/widget-plugin-filtering/controls/select/Select";

enableStaticRendering(true);

function Preview(props: DatagridDropdownFilterPreviewProps): ReactElement {
    return (
        <Select
            className={props.class}
            ariaLabel={props.ariaLabel}
            style={parseStyle(props.style)}
            options={[]}
            empty={!props.clearable}
            clearable={props.clearable}
            showCheckboxes={false}
            value={getPreviewValue(props)}
            onClear={noop}
            useSelectProps={() => ({ items: [] })}
        />
    );
}

const noop = (): void => {};

function getPreviewValue(props: DatagridDropdownFilterPreviewProps): string {
    let value = props.defaultValue;
    value ||= props.emptySelectionCaption || (props.filterable ? "Search" : "Select");
    return value;
}

export function preview(props: DatagridDropdownFilterPreviewProps): ReactElement {
    return <Preview {...props} />;
}
