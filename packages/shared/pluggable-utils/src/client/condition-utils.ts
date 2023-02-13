import { ListReferenceSetValue, ListReferenceValue, ObjectItem } from "mendix";
import { ContainsCondition, EqualsCondition, FilterCondition } from "mendix/filters";
import { association, literal, equals, contains, empty, or } from "mendix/filters/builders";

export function referenceEquals(associationValue: ListReferenceValue, value: ObjectItem): EqualsCondition {
    return equals(association(associationValue.id), literal(value));
}

export function referenceSetContains(associationValue: ListReferenceSetValue, value: ObjectItem[]): ContainsCondition {
    const v = value.length ? literal(value.slice()) : empty();
    return contains(association(associationValue.id), v);
}

export function referenceEqualsOneOf(association: ListReferenceValue, values: ObjectItem[]): FilterCondition {
    const expressions = values.map(value => referenceEquals(association, value));

    return expressions.length > 1 ? or(...expressions) : expressions[0];
}

export function referenceSetContainsOneOf(association: ListReferenceSetValue, values: ObjectItem[]): FilterCondition {
    const expressions = values.map(value => referenceSetContains(association, [value]));

    return expressions.length > 1 ? or(...expressions) : expressions[0];
}
