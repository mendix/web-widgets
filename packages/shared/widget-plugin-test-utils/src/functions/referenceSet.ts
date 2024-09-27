import { ReferenceSetValue } from "mendix";
import { ReferenceSetValueBuilder } from "../builders/ReferenceSetValueBuilder";

/**
 * Short function to mock `ReferenceSetValue`.
 * @param factory - optional factory function which takes
 * ReferenceSetValueBuilder as first argument and returns new `ReferenceSetValue`.
 */
export function referenceSet(factory?: (builder: ReferenceSetValueBuilder) => ReferenceSetValue): ReferenceSetValue {
    factory ??= builder => builder.build();
    return factory(new ReferenceSetValueBuilder());
}
