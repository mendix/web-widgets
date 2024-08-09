import { observer } from "mobx-react-lite";
import { createElement, ReactElement, useRef } from "react";
import { useSortControl } from "@mendix/widget-plugin-sorting/helpers/useSortControl";
import { SortingStoreInterface } from "@mendix/widget-plugin-sorting/typings";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { DropdownSortContainerProps } from "../typings/DropdownSortProps";
import { SortComponent } from "./components/SortComponent";
import { withSortStore } from "./hocs/withSortStore";

function Container(props: DropdownSortContainerProps & { sortStore: SortingStoreInterface }): ReactElement {
    const id = (useRef<string>().current ??= `DropdownSort${generateUUID()}`);
    const sortProps = useSortControl(
        { ...props, emptyOptionCaption: props.emptyOptionCaption?.value },
        props.sortStore
    );

    return (
        <SortComponent
            className={props.class}
            placeholder={props.emptyOptionCaption?.value}
            id={id}
            screenReaderButtonCaption={props.screenReaderButtonCaption?.value}
            screenReaderInputCaption={props.screenReaderInputCaption?.value}
            styles={props.style}
            tabIndex={props.tabIndex}
            {...sortProps}
        />
    );
}

const Widget = withSortStore(observer(Container));

export function DropdownSort(props: DropdownSortContainerProps): ReactElement {
    return <Widget {...props} />;
}
