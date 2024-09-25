import { EditableValue } from "mendix";
import { EditableValueBuilder } from "../builders/EditableValueBuilder";

type Value = string | boolean | Date | Big;
type Factory<T extends Value> = (builder: EditableValueBuilder<T>) => EditableValue<T>;

/**
 * Short function to mock EditableValue.
 * @param factory - optional factory. Accept builder as first argument.
 * @returns {EditableValue}
 */
export function editable<T extends Value>(factory?: Factory<T>): EditableValue<T> {
    factory ??= builder => builder.build();
    return factory(new EditableValueBuilder<T>());
}

/**
 * Shorthand for builder.withValue().
 * @param value
 */
editable.with = _with;

function _with(value: Date): EditableValue<Date>;
function _with(value: Big): EditableValue<Big>;
function _with(value: boolean): EditableValue<boolean>;
function _with(value: string): EditableValue<string>;
function _with<T extends Value>(value: T): EditableValue<T> {
    return editable<T>(builder => builder.withValue(value).build());
}
