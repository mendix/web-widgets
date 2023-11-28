import { FilterState, FilterType, useMultipleFiltering } from "@mendix/widget-plugin-filtering";
import { FilterCondition } from "mendix/filters";
import { and } from "mendix/filters/builders";
import { useEffect, useRef, useState } from "react";
import { DatagridContainerProps } from "../../../typings/DatagridProps";

type ColumnFiltersArray = Array<ReturnType<typeof useState<FilterState>>>;
type HeaderFilters = ReturnType<typeof useMultipleFiltering>;
type SetFiltered = React.Dispatch<React.SetStateAction<boolean>>;
type RestoredRef = React.MutableRefObject<FilterCondition | undefined>;

export function useFiltering(
    props: DatagridContainerProps
): [ColumnFiltersArray, HeaderFilters, SetFiltered, RestoredRef] {
    const viewStateFilters = useRef<FilterCondition | undefined>(undefined);
    const [filtered, setFiltered] = useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const customFiltersState = props.columns.map(() => useState<FilterState>());
    const multipleFilteringState = useMultipleFiltering();

    const filters = customFiltersState
        .map(([customFilter]) => customFilter?.getFilterCondition?.())
        .filter((filter): filter is FilterCondition => filter !== undefined)
        .concat(
            // Concatenating multiple filter state
            Object.keys(multipleFilteringState)
                .map((key: FilterType) => multipleFilteringState[key][0]?.getFilterCondition())
                .filter((filter): filter is FilterCondition => filter !== undefined)
        );

    if (filters.length > 0) {
        props.datasource.setFilter(filters.length > 1 ? and(...filters) : filters[0]);
    } else if (filtered) {
        props.datasource.setFilter(undefined);
    } else {
        props.datasource.setFilter(viewStateFilters.current);
    }

    useEffect(() => {
        if (props.datasource.filter && !filtered && !viewStateFilters.current) {
            viewStateFilters.current = props.datasource.filter;
        }
    }, [props.datasource, props.configurationAttribute, filtered]);

    return [customFiltersState, multipleFilteringState, setFiltered, viewStateFilters];
}
