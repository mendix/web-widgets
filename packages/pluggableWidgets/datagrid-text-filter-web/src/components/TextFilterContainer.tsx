import { createElement, useRef } from "react";
import { observer } from "mobx-react-lite";
import { FilterFnList, InputWithFilters, useInputProps } from "@mendix/widget-plugin-filtering/controls";
import { DatagridTextFilterContainerProps, DefaultFilterEnum } from "../../typings/DatagridTextFilterProps";
import { InputFilterInterface, useBasicSync } from "@mendix/widget-plugin-filtering";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";

const filterDefs: Record<DefaultFilterEnum, string> = {
    contains: "Contains",
    startsWith: "Starts with",
    endsWith: "Ends with",
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

export interface ContainerProps extends DatagridTextFilterContainerProps {
    parentChannelName: string | null;
    filterStore: InputFilterInterface;
}

// eslint-disable-next-line prefer-arrow-callback
export const TextFilterContainer: (props: ContainerProps) => React.ReactElement = observer(function TextFilterContainer(
    props
) {
    const id = (useRef<string>().current ??= `TextFilter${generateUUID()}`);

    const inputProps = useInputProps({
        defaultFilter: props.defaultFilter,
        defaultValue: props.defaultValue?.value,
        filterStore: props.filterStore,
        disableInputs: filter => filter === "empty" || filter === "notEmpty",
        changeDelay: props.delay,
        filters
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
            type="text"
            {...inputProps}
        />
    );
});
