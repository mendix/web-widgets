import { observer } from "mobx-react-lite";
import { createElement, ReactElement } from "react";
import { useSortControl } from "@mendix/widget-plugin-sorting/helpers/useSortControl";
import { SortingStoreInterface } from "@mendix/widget-plugin-sorting/SortingStoreInterface";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { DropdownSortContainerProps } from "../typings/DropdownSortProps";
import { SortComponent } from "./components/SortComponent";
import { withLinkedSortStore, withSortAPI } from "./hocs/withLinkedSortStore";
import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";

function Container(props: DropdownSortContainerProps & { sortStore: SortingStoreInterface }): ReactElement {
    const id = useConst(() => `DropdownSort${generateUUID()}`);

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

export const DropdownSort = withSortAPI(withLinkedSortStore(observer(Container)));
