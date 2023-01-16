import { useFilterContextValue } from "@mendix/pluggable-widgets-commons/components/web";
import { createElement, ReactElement } from "react";
import { DatagridDropdownFilterContainerProps } from "../typings/DatagridDropdownFilterProps";
import { EnumerationFilter } from "./components/EnumerationFilter";
import { ErrorBox } from "./components/ErrorBox";
import { AssociationFilter } from "./components/AssociationFilter";
import { OutOfProviderError } from "./features/errors";

export default function DatagridDropdownFilter(props: DatagridDropdownFilterContainerProps): ReactElement {
    const context = useFilterContextValue();

    if (context.hasError) {
        return <ErrorBox error={new OutOfProviderError()} />;
    }

    const Filter = context.value.associationProperties ? AssociationFilter : EnumerationFilter;

    return <Filter context={context.value} widgetProps={props} />;
}
