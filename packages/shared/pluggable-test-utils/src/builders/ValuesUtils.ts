import { ReactNode } from "react";
import type { Big } from "big.js";
import type { ListExpressionValue, ListWidgetValue, ObjectItem } from "mendix";
import { dynamicValue } from "./DynamicActionValueBuilder.js";

export function buildListExpression<T extends string | boolean | Date | Big>(value: T): ListExpressionValue<T> {
    return { get: () => dynamicValue<T>(value) } as Pick<ListExpressionValue, "get"> as ListExpressionValue<T>;
}

export function buildWidgetValue(value: ReactNode): ListWidgetValue {
    return { get: () => value } as Pick<ListWidgetValue, "get"> as ListWidgetValue;
}

export function objectItems(length = 1): ObjectItem[] {
    return Array.from(
        { length: Math.max(length, 1) },
        () => ({ id: Math.random().toFixed(16).slice(2) } as ObjectItem)
    );
}
