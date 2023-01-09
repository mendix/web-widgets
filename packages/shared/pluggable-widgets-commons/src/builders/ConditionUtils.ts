import { ListReferenceSetValue, ListReferenceValue, ObjectItem } from "mendix";
import { ContainsCondition, EqualsCondition } from "mendix/filters";
import { association, literal, equals, contains, empty } from "mendix/filters/builders";

export function referenceEqualsCondition(associationValue: ListReferenceValue, value: ObjectItem): EqualsCondition {
    return equals(association(associationValue.id), literal(value));
}

export function referenceSetContainsCondition(
    associationValue: ListReferenceSetValue,
    value: ObjectItem[]
): ContainsCondition {
    const v = value.length ? literal(value.slice()) : empty();
    return contains(association(associationValue.id), v);
}
