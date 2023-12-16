import { FilterCondition, ValueExpression } from "mendix/filters";
import { FilterState } from "@mendix/widget-plugin-filtering";
import { and, literal, equals } from "mendix/filters/builders";
import { Filter } from "../../typings/GridModel";

export function reduceFilters(filters: Filter[]): Filter {
    const filtered = filters.filter((cond): cond is FilterCondition => cond !== undefined);

    switch (filtered.length) {
        case 0:
            return undefined;
        case 1:
            return filtered[0];
        default:
            return and(...filtered);
    }
}

export function reduceFiltersMap<T>(filtersMap: Map<T, FilterState>): Filter {
    const filters = [...filtersMap].map(([_, state]) => state.getFilterCondition());
    return reduceFilters(filters);
}

export function zipFilters(a: Filter, b: Filter): Filter {
    const left = a === undefined ? equals(literal(true), literal(true)) : a;
    const right = b === undefined ? equals(literal(true), literal(true)) : b;
    return and(left, right);
}

function isPlaceholder(f: Filter): boolean {
    const isLiteralTrue = (f: ValueExpression): boolean => f?.type === "literal" && f.value === true;

    return f?.name === "=" && isLiteralTrue(f.arg1) && isLiteralTrue(f.arg2);
}

export function unzipFilter(filter: Filter): [Filter, Filter] {
    if (filter?.type === "function" && filter.name === "and" && filter.args.length === 2) {
        const [a, b] = filter.args;
        return [isPlaceholder(a) ? undefined : a, isPlaceholder(b) ? undefined : b];
    }

    return [undefined, undefined];
}
