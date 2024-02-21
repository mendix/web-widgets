import {
    BaseProps,
    StringHelper,
    FilterList,
    InputWithFilters,
    useInputProps
} from "@mendix/widget-plugin-filtering/controls";
import { createElement } from "react";
import { DefaultFilterEnum } from "../../typings/DatagridTextFilterProps";

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

const filters: FilterList<DefaultFilterEnum> = Object.entries(filterDefs).map(
    ([value, label]: [DefaultFilterEnum, string]) => ({
        value,
        label
    })
);

export interface FilterComponentProps extends BaseProps {
    defaultFilter: DefaultFilterEnum;
    value: string | undefined;
    onChange: (value: string | undefined, type: DefaultFilterEnum) => void;
    parentChannelName: string | null;
    changeDelay?: number;
}

export function FilterComponent(props: FilterComponentProps): React.ReactElement {
    const { defaultFilter, value, onChange, parentChannelName, changeDelay, ...baseProps } = props;
    const inputProps = useInputProps({
        name: baseProps.name,
        parentChannelName,
        inputType: "text",
        inputDisabled: filter => filter === "empty" || filter === "notEmpty",
        changeDelay,
        defaultFilter,
        filters,
        value,
        onChange,
        valueHelper: StringHelper
    });
    return <InputWithFilters {...baseProps} {...inputProps} />;
}
