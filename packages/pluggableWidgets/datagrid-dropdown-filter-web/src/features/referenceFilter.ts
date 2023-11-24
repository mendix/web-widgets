import { DispatchFilterUpdate } from "@mendix/widget-plugin-filtering";
import { tuple } from "@mendix/widget-plugin-platform/utils/tuple";
import { ActionValue, ListReferenceSetValue, ListReferenceValue, ObjectItem } from "mendix";
import { referenceEqualsOneOf, referenceSetContainsOneOf } from "../utils/condition";
import { Option } from "../utils/types";

type ValueToObjectMap = Record<string, ObjectItem>;

function optionsToObjects(objectMap: ValueToObjectMap, options: Option[]): ObjectItem[] {
    // handle "empty" option
    const cleanOptions = options[0]?.value === "" ? [] : options;
    return cleanOptions.map(option => objectMap[option.value]);
}

export function getOptions<T extends ObjectItem>(items: T[], getLabel: (o: T) => string): [Option[], ValueToObjectMap] {
    const options = items.map<Option>(obj => ({
        value: obj.id,
        caption: getLabel(obj)
    }));

    const objectMap = Object.fromEntries(items.map(obj => [obj.id, obj]));

    return tuple(options, objectMap);
}

export function getOnChange(
    dispatch: DispatchFilterUpdate,
    association: ListReferenceValue | ListReferenceSetValue,
    objectMap: ValueToObjectMap,
    onChangeAction?: ActionValue
): (values: Option[]) => void {
    return (options: Option[]): void => {
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
