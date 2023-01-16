import { createElement, ReactElement } from "react";
import { useDropdownId } from "../hooks/useDropdownId";
import { getFilterProps } from "../features/enumerationFilter";
import { FilterProps } from "../utils/types";
import { ErrorBox } from "./ErrorBox";
import { FilterComponent } from "./FilterComponent";

export function EnumerationFilter(props: FilterProps): ReactElement {
    const id = useDropdownId();
    const filterProps = getFilterProps(props.context, props.widgetProps);

    if (filterProps.hasError) {
        return <ErrorBox error={filterProps.error} />;
    }

    return <FilterComponent {...filterProps.value} id={id} />;
}
