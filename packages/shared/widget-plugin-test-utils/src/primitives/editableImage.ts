import type { EditableImageValue, ImageValue } from "mendix";
import { EditableImageValueBuilder } from "../builders/EditableImageValueBuilder.js";

type Factory<T extends ImageValue> = (builder: EditableImageValueBuilder<T>) => EditableImageValue<T>;

/**
 * Short function to mock EditableImageValue.
 * @param factory - optional factory. Accept builder as first argument.
 * @returns {EditableImageValue}
 */
export function editableImage<T extends ImageValue>(factory?: Factory<T>): EditableImageValue<T> {
    factory ??= builder => builder.build();
    return factory(new EditableImageValueBuilder<T>());
}

/**
 * Shorthand for builder.withValue().
 * @param value
 */
editableImage.with = _with;

function _with<T extends ImageValue>(value: T): EditableImageValue<T> {
    return editableImage<T>(builder => builder.withValue(value).build());
}
