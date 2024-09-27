import { ReferenceValue } from "mendix";
import { ReferenceValueBuilder } from "../builders/ReferenceValueBuilder";

/**
 * Short function to mock `ReferenceValue`.
 * @param factory - optional factory function which takes
 * ReferenceValueBuilder as first argument and returns new `ReferenceValue`.
 */
export function reference(factory?: (builder: ReferenceValueBuilder) => ReferenceValue): ReferenceValue {
    factory ??= builder => builder.build();
    return factory(new ReferenceValueBuilder());
}
