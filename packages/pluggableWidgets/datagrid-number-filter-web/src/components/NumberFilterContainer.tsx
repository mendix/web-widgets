import { observer } from "mobx-react-lite";
import { Number_InputFilterInterface, useBasicSync } from "@mendix/widget-plugin-filtering";
import { FilterFnList, InputWithFilters, useInputProps } from "@mendix/widget-plugin-filtering/controls";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { createElement, useRef } from "react";
import { DatagridNumberFilterContainerProps, DefaultFilterEnum } from "../../typings/DatagridNumberFilterProps";

const filterDefs: Record<DefaultFilterEnum, string> = {
    greater: "Greater than",
    greaterEqual: "Greater than or equal",
    equal: "Equal",
    notEqual: "Not equal",
    smaller: "Smaller than",
    smallerEqual: "Smaller than or equal",
    empty: "Empty",
    notEmpty: "Not empty"
};

const filters: FilterFnList<DefaultFilterEnum> = Object.entries(filterDefs).map(
    ([value, label]: [DefaultFilterEnum, string]) => ({
        value,
        label
    })
);

export interface ContainerProps extends DatagridNumberFilterContainerProps {
    filterStore: Number_InputFilterInterface;
    parentChannelName: string | null;
}

function Container(props: ContainerProps): React.ReactElement {
    const id = (useRef<string>().current ??= `NumberFilter${generateUUID()}`);

    const inputProps = useInputProps({
        changeDelay: props.delay,
        defaultFilter: props.defaultFilter,
        defaultValue: props.defaultValue?.value,
        disableInputs: filter => filter === "empty" || filter === "notEmpty",
        filters,
        filterStore: props.filterStore
    });

    useBasicSync(props, props.filterStore);

    return (
        <InputWithFilters
            adjustable={props.adjustable}
            className={props.class}
            id={id}
            placeholder={props.placeholder?.value}
            screenReaderButtonCaption={props.screenReaderButtonCaption?.value}
            screenReaderInputCaption={props.screenReaderInputCaption?.value}
            styles={props.style}
            tabIndex={props.tabIndex}
            name={props.name}
            type="number"
            {...inputProps}
        />
    );
}

export const NumberFilterContainer = observer(Container);
