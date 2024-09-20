import { createElement, ReactElement, useMemo, useRef } from "react";
import { DatagridTextFilterPreviewProps } from "../typings/DatagridTextFilterProps";
import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";
import { InputWithFilters } from "@mendix/widget-plugin-filtering/controls";
import { InputStore } from "@mendix/widget-plugin-filtering/stores/InputStore";

function Preview(props: DatagridTextFilterPreviewProps): ReactElement {
    const inputStores = useMemo<[InputStore, InputStore]>(
        () => [new InputStore(props.defaultValue), new InputStore()],
        [props.defaultValue]
    );

    return (
        <InputWithFilters
            adjustable={props.adjustable}
            className={props.class}
            filterFn={props.defaultFilter}
            filterFnList={[]}
            inputRef={useRef(null)}
            inputStores={inputStores}
            name="TextFilter"
            onFilterChange={() => {
                //
            }}
            placeholder={props.placeholder}
            screenReaderButtonCaption={props.screenReaderButtonCaption}
            screenReaderInputCaption={props.screenReaderInputCaption}
            styles={parseStyle(props.style)}
            type="text"
        />
    );
}

export function preview(props: DatagridTextFilterPreviewProps): ReactElement {
    return <Preview {...props} />;
}
