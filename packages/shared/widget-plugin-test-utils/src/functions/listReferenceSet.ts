import { ListReferenceSetValue } from "mendix";
import { ListReferenceSetValueBuilder } from "../builders/ListReferenceSetValueBuilder";

/**
 * Short function to mock `ListReferenceSetValue`.
 * @param factory - optional factory function which takes
 * ListReferenceSetValueBuilder as first argument and returns new `ListReferenceSetValue`.
 */
export function listReferenceSet(
    factory?: (builder: ListReferenceSetValueBuilder) => ListReferenceSetValue
): ListReferenceSetValue {
    factory ??= builder => builder.build();
    return factory(new ListReferenceSetValueBuilder());
}
