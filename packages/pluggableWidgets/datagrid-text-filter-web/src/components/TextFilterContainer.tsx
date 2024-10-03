import { FilterFnList, InputWithFilters } from "@mendix/widget-plugin-filtering/controls";
import { useBasicSync } from "@mendix/widget-plugin-filtering/helpers/useBasicSync";
import { useStringFilterController } from "@mendix/widget-plugin-filtering/helpers/useStringFilterController";
import { String_InputFilterInterface } from "@mendix/widget-plugin-filtering/typings/InputFilterInterface";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { observer } from "mobx-react-lite";
import { createElement, useRef } from "react";
import { DatagridTextFilterContainerProps, DefaultFilterEnum } from "../../typings/DatagridTextFilterProps";
import { useOnResetValueEvent, useOnSetValueEvent } from "@mendix/widget-plugin-external-events/hooks";

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
    parentChannelName: string | undefined;
    filterStore: String_InputFilterInterface;
}

// eslint-disable-next-line prefer-arrow-callback
export const TextFilterContainer: (props: ContainerProps) => React.ReactElement = observer(function TextFilterContainer(
    props
) {
    const id = (useRef<string>().current ??= `TextFilter${generateUUID()}`);

    const controller = useStringFilterController({
        filter: props.filterStore,
        defaultFilter: props.defaultFilter,
        defaultValue: props.defaultValue?.value,
        changeDelay: props.delay,
        disableInputs: fn => fn === "empty" || fn === "notEmpty"
    });

    useBasicSync(props, props.filterStore);

    useOnResetValueEvent({
        widgetName: props.name,
        parentChannelName: props.parentChannelName,
        listener: controller.handleResetValue
    });

    useOnSetValueEvent({ widgetName: props.name, listener: controller.handleSetValue });

    return (
        <InputWithFilters
            adjustable={props.adjustable}
            className={props.class}
            disableInputs={controller.disableInputs}
            filterFn={controller.selectedFn}
            filterFnList={filters}
            id={id}
            inputRef={controller.inputRef}
            inputStores={controller.inputs}
            name={props.name}
            onFilterChange={controller.handleFilterFnChange}
            placeholder={props.placeholder?.value}
            screenReaderButtonCaption={props.screenReaderButtonCaption?.value}
            screenReaderInputCaption={props.screenReaderInputCaption?.value}
            styles={props.style}
            tabIndex={props.tabIndex}
            type="text"
            defaultValue={props.defaultValue?.value}
        />
    );
});
