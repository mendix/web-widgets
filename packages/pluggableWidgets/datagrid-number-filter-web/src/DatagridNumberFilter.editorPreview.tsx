import { enableStaticRendering } from "mobx-react-lite";
enableStaticRendering(true);

import { createElement, ReactElement, useMemo, useRef } from "react";
import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";
import { InputWithFiltersComponent } from "@mendix/widget-plugin-filtering/controls";
import { DatagridNumberFilterPreviewProps } from "../typings/DatagridNumberFilterProps";
import { InputStore } from "@mendix/widget-plugin-filtering/stores/input/InputStore";

function Preview(props: DatagridNumberFilterPreviewProps): ReactElement {
    const inputStores = useMemo<[InputStore, InputStore]>(
        () => [new InputStore(props.defaultValue), new InputStore()],
        [props.defaultValue]
    );

    return (
        <InputWithFiltersComponent
            adjustable={props.adjustable}
            className={props.class}
            filterFn={props.defaultFilter}
            filterFnList={[]}
            inputRef={useRef(null)}
            inputStores={inputStores}
            name="NumberFilter"
            onFilterChange={() => {}}
            placeholder={props.placeholder}
            screenReaderButtonCaption={props.screenReaderButtonCaption}
            screenReaderInputCaption={props.screenReaderInputCaption}
            styles={parseStyle(props.style)}
            type="text"
        />
    );
}

export function preview(props: DatagridNumberFilterPreviewProps): ReactElement {
    return <Preview {...props} />;
}
