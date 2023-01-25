import {
    referenceEqualsOneOf,
    referenceSetContainsOneOf
} from "@mendix/pluggable-widgets-commons/dist/builders/ConditionUtils";
import { ConditionDispatch } from "@mendix/pluggable-widgets-commons/dist/components/web";
import { tuple } from "@mendix/pluggable-widgets-commons/dist/utils/tuple";
import { ActionValue, ListReferenceSetValue, ListReferenceValue, ObjectItem } from "mendix";
import { FilterOption, FilterValueChangeCallback } from "../components/FilterComponent";

type ValueToObjectMap = Record<string, ObjectItem>;

function optionsToObjects(objectMap: ValueToObjectMap, options: FilterOption[]): ObjectItem[] {
    // handle "empty" option
    const cleanOptions = options[0]?.value === "" ? [] : options;
    return cleanOptions.map(option => objectMap[option.value]);
}

export function getOptions<T extends ObjectItem>(
    items: T[],
    getLabel: (o: T) => string
): [FilterOption[], ValueToObjectMap] {
    const options = items.map<FilterOption>(obj => ({
        value: obj.id,
        caption: getLabel(obj)
    }));

    const objectMap = Object.fromEntries(items.map(obj => [obj.id, obj]));

    return tuple(options, objectMap);
}

export function getOnChange(
    dispatch: ConditionDispatch,
    association: ListReferenceValue | ListReferenceSetValue,
    objectMap: ValueToObjectMap,
    onChangeAction?: ActionValue
): FilterValueChangeCallback {
    return (options: FilterOption[]): void => {
        const values = optionsToObjects(objectMap, options);

        dispatch({
            getFilterCondition() {
                if (values.length < 1) {
                    return undefined;
                }
                if (association.type === "Reference") {
                    return referenceEqualsOneOf(association, values);
                }
                return referenceSetContainsOneOf(association, values);
            }
        });

        if (onChangeAction) {
            onChangeAction.execute();
        }
    };
}
