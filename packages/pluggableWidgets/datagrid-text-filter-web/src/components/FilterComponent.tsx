import { createElement } from "react";
import { observer } from "mobx-react-lite";
import { BaseProps, FilterFnList, InputWithFilters, useInputProps } from "@mendix/widget-plugin-filtering/controls";
import { DefaultFilterEnum } from "../../typings/DatagridTextFilterProps";
import { InputFilterInterface } from "@mendix/widget-plugin-filtering";

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

export interface FilterComponentProps extends BaseProps {
    defaultFilter: DefaultFilterEnum;
    defaultValue?: string;
    parentChannelName: string | null;
    filterStore: InputFilterInterface;
    changeDelay?: number;
}

// eslint-disable-next-line prefer-arrow-callback
export const FilterComponent = observer(function FilterComponent(props: FilterComponentProps): React.ReactElement {
    const { defaultFilter, defaultValue, parentChannelName, changeDelay, ...baseProps } = props;
    const inputProps = useInputProps({
        name: baseProps.name,
        parentChannelName,
        defaultFilter,
        defaultValue,
        filterStore: props.filterStore,
        disableInputs: filter => filter === "empty" || filter === "notEmpty",
        changeDelay,
        filters
    });
    return <InputWithFilters {...baseProps} {...inputProps} />;
});
