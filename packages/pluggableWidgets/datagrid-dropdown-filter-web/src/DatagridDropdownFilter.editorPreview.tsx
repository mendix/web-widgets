import { enableStaticRendering } from "mobx-react-lite";
enableStaticRendering(true);

import { createElement, ReactElement } from "react";
import { DatagridDropdownFilterPreviewProps } from "../typings/DatagridDropdownFilterProps";
import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";
import { Select } from "@mendix/widget-plugin-filtering/controls/select/Select";

function Preview(props: DatagridDropdownFilterPreviewProps): ReactElement {
    const yes = false;
    if (yes) {
        return <span>ok</span>;
    }

    return (
        <Select
            className={props.class}
            style={parseStyle(props.style)}
            options={[]}
            empty={!props.clearable}
            clearable={props.clearable}
            value={props.defaultValue || "Select"}
            onClear={noop}
            useSelectProps={() => ({ items: [] })}
        />
    );
}

const noop = (): void => {};

export function preview(props: DatagridDropdownFilterPreviewProps): ReactElement {
    return <Preview {...props} />;
}
