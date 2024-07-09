import { ListAttributeValue } from "mendix";
import { DateInputFilterStore, NumberInputFilterStore, StringInputFilterStore } from "./stores/InputFilterStore";
import { StaticSelectFilterStore } from "./stores/StaticSelectFilterStore";
import { SelectOnlyFilter } from "./stores/typings/ComboboxFilterInterface";
import { InputFilterInterface } from "./stores/typings/InputFilterInterface";

export function attrgroupFilterStore(
    type: ListAttributeValue["type"],
    attributes: ListAttributeValue[]
): InputFilterInterface | SelectOnlyFilter | undefined {
    switch (type) {
        case "DateTime":
            return new DateInputFilterStore(attributes as Array<ListAttributeValue<Date>>);

        case "AutoNumber":
        case "Decimal":
        case "Integer":
        case "Long":
            return new NumberInputFilterStore(attributes as Array<ListAttributeValue<Big>>);

        case "String":
            return new StringInputFilterStore(attributes as Array<ListAttributeValue<string>>);

        case "Boolean":
        case "Enum":
            return new StaticSelectFilterStore(attributes);
        default:
            console.error("attrgroupFilterStore: not supported type " + type, attributes);
            return undefined;
    }
}
