import { ListAttributeValue } from "mendix";
import { FilterCondition } from "mendix/filters";
import { attribute, contains, literal, startsWith } from "mendix/filters/builders";
import { FilterTypeEnum } from "../../typings/ComboboxProps";

export function datasourceFilter(
    type: FilterTypeEnum,
    search: string,
    id: ListAttributeValue["id"]
): FilterCondition | undefined {
    if (type === "none" || !search) {
        return undefined;
    }

    const filters = {
        contains,
        startsWith
    };

    if (type === "containsExact") {
        return filters.contains(attribute(id), literal(search));
    }

    return filters[type](attribute(id), literal(search));
}
