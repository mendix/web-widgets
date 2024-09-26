import { ListReferenceValue } from "mendix";
import { ListReferenceValueBuilder } from "../builders/ListReferenceValueBuilder";

/**
 * Short function to mock ListReferenceValue.
 * @param factory - optional factory function which takes
 * ListReferenceValueBuilder as first argument and returns new ReferenceValue.
 */
export function listRef(factory?: (builder: ListReferenceValueBuilder) => ListReferenceValue): ListReferenceValue {
    factory ??= builder => builder.build();
    return factory(new ListReferenceValueBuilder());
}
