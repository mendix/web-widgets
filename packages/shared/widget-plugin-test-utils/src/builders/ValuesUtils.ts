import { ReactNode } from "react";
import type { Big } from "big.js";
import type { ListValue, ListExpressionValue, ListWidgetValue, ObjectItem } from "mendix";
import { dynamicValue } from "./DynamicActionValueBuilder.js";
import { ListValueBuilder } from "./ListValueBuilder";

export function buildListExpression<T extends string | boolean | Date | Big>(value: T): ListExpressionValue<T> {
    return { get: () => dynamicValue<T>(value) } as Pick<ListExpressionValue, "get"> as ListExpressionValue<T>;
}

export function buildWidgetValue(value: ReactNode): ListWidgetValue {
    return { get: () => value } as Pick<ListWidgetValue, "get"> as ListWidgetValue;
}

export function objectItems(length = 1): ObjectItem[] {
    length = Math.floor(length);
    if (length > 0) {
        return Array.from({ length }, () => ({ id: Math.random().toFixed(16).slice(2) } as ObjectItem));
    }

    return [];
}

export function list(n: number): ListValue {
    return ListValueBuilder().withItems(objectItems(n));
}
