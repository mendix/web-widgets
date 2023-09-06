import { ListReferenceSetValue, ListReferenceValue, ObjectItem } from "mendix";
import { ContainsCondition, EqualsCondition, FilterCondition } from "mendix/filters";
import { association, literal, equals, contains, empty, or } from "mendix/filters/builders";

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

export function referenceEqualsOneOf(association: ListReferenceValue, values: ObjectItem[]): FilterCondition {
    const expressions = values.map(value => referenceEqualsCondition(association, value));

    if (expressions.length > 1) {
        return or(...expressions);
    }

    return expressions[0];
}

export function referenceSetContainsOneOf(association: ListReferenceSetValue, values: ObjectItem[]): FilterCondition {
    const expressions = values.map(value => referenceSetContainsCondition(association, [value]));

    if (expressions.length > 1) {
        return or(...expressions);
    }

    return expressions[0];
}
