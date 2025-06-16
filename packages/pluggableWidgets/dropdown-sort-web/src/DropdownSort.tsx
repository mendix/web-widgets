import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { withLinkedSortStore } from "@mendix/widget-plugin-sorting/react/hocs/withLinkedSortStore";
import { withSortAPI } from "@mendix/widget-plugin-sorting/react/hocs/withSortAPI";
import { useSortSelect } from "@mendix/widget-plugin-sorting/react/useSortSelect";
import { BasicSortStore } from "@mendix/widget-plugin-sorting/types/store";
import { observer } from "mobx-react-lite";
import { createElement, ReactElement } from "react";
import { DropdownSortContainerProps } from "../typings/DropdownSortProps";
import { SortComponent } from "./components/SortComponent";

function Container(props: DropdownSortContainerProps & { sortStore: BasicSortStore }): ReactElement {
    const id = useConst(() => `DropdownSort${generateUUID()}`);

    const sortProps = useSortSelect({
        emptyOptionCaption: props.emptyOptionCaption?.value,
        sortStore: props.sortStore
    });

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
