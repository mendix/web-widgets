import { tuple } from "@mendix/pluggable-widgets-commons/dist/utils/tuple";
import { ListAttributeValue, ListValue, ValueStatus, ObjectItem, Option } from "mendix";
import { createElement, memo, ReactElement, useCallback, useMemo, useRef } from "react";
import { FilterComponent, FilterOption, FilterComponentProps } from "./FilterComponent";

type ValueToObjectMap = Record<string, ObjectItem>;

type FilterDefaultValue = string | undefined;

type UseOptionsResult = [FilterOption[], ValueToObjectMap, FilterDefaultValue];

function useOptions(list: ListValue, attribute: ListAttributeValue, selected: ObjectItem[]): UseOptionsResult {
    return useMemo(() => {
        if (list.status === ValueStatus.Unavailable) {
            return tuple([], {}, undefined);
        }

        const items = list.items ?? [];

        const getCaption = <T,>(valueObj: { displayValue?: string; value: Option<T> }): string => {
            const value = valueObj.displayValue ?? valueObj.value ?? "Attribute value is unavailable";
            return `${value}`;
        };

        const objectToOption = (obj: ObjectItem): FilterOption => ({
            value: obj.id,
            caption: getCaption(attribute.get(obj))
        });

        const options = items.map(objectToOption);
        const objectMap = items.reduce<ValueToObjectMap>((acc, item) => {
            acc[item.id] = item;
            return acc;
        }, {});
        const defaultValue = selected.length ? selected.map(obj => obj.id).join(",") : undefined;

        return tuple(options, objectMap, defaultValue);
    }, [list, attribute, selected]);
}

export interface ObjectSelectorProps extends Omit<FilterComponentProps, "options" | "defaultValue" | "updateFilter"> {
    onChange: (value: ObjectItem[]) => void;
    optionsDatasource: ListValue;
    optionAttribute: ListAttributeValue;
}

// eslint-disable-next-line prefer-arrow-callback
const ObjectSelector = memo(function Dropdown(props: ObjectSelectorProps): ReactElement {
    const { onChange, optionsDatasource, optionAttribute, ...filterOptions } = props;
    const selected = useRef([]);
    const [options, valueToObjectMap, defaultValue] = useOptions(optionsDatasource, optionAttribute, selected.current);

    const updateFilters = useCallback(
        (options: FilterOption[]) => {
            // handle "empty" option
            const value = options[0]?.value === "" ? [] : options;
            onChange(value.map(option => valueToObjectMap[option.value]));
        },
        [onChange, valueToObjectMap]
    );

    return (
        <FilterComponent
            options={options}
            defaultValue={defaultValue}
            updateFilters={updateFilters}
            {...filterOptions}
        />
    );
});

export { ObjectSelector };
