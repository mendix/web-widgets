import { useMemo } from "react";
import { FilterCondition } from "mendix/filters";
import { AssociationProperties, FilterState } from "@mendix/widget-plugin-filtering";
import { ensure } from "@mendix/widget-plugin-platform/utils/ensure";
import { ColumnsType } from "../../../typings/DatagridProps";

export function getAssociationProps(columnProps: ColumnsType): AssociationProperties {
    const msg = (propName: string): string =>
        `Can't map ColumnsType to AssociationProperties: ${propName} is undefined`;

    const association = ensure(columnProps.filterAssociation, msg("filterAssociation"));
    const optionsSource = ensure(columnProps.filterAssociationOptions, msg("filterAssociationOptions"));
    const labelSource = ensure(columnProps.filterAssociationOptionLabel, msg("filterAssociationOptionLabel"));

    const props: AssociationProperties = {
        association,
        optionsSource,
        getOptionLabel: item => labelSource.get(item).value ?? "Error: unable to get caption"
    };

    return props;
}

export function filterToCond(state: FilterState | undefined): FilterCondition[] {
    const cond = state?.getFilterCondition();
    return cond ? [cond] : [];
}

export function useOnce<T>(fn: () => T): T {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(fn, []);
}
