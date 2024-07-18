// import { useFilterContextValue } from "@mendix/widget-plugin-filtering";
// import { createElement, Fragment, ReactElement } from "react";
// import { DatagridDropdownFilterContainerProps } from "../typings/DatagridDropdownFilterProps";
// import { EnumerationFilter } from "./components/EnumerationFilter";
// import { ErrorBox } from "./components/ErrorBox";
// import { AssociationFilter } from "./components/AssociationFilter";
// import { OutOfProviderError } from "./features/errors";

// export default function DatagridDropdownFilter(props: DatagridDropdownFilterContainerProps): ReactElement {
//     const context = useFilterContextValue();

//     if (context.hasError) {
//         return <ErrorBox error={new OutOfProviderError()} />;
//     }

//     if (props.defaultValue?.status === "loading") {
//         return <Fragment />;
//     }

//     const Filter = context.value.associationProperties ? AssociationFilter : EnumerationFilter;

//     return <Filter context={context.value} widgetProps={props} />;
// }
import { createElement, ReactElement } from "react";
import { DatagridDropdownFilterContainerProps } from "../typings/DatagridDropdownFilterProps";
import { useFilterContextValue } from "@mendix/widget-plugin-filtering";
import { StaticFilterContainer } from "./components/StaticFilterContainer";

export default function DatagridDropdownFilter(_props: DatagridDropdownFilterContainerProps): ReactElement {
    const apiv2 = useFilterContextValue();

    if (apiv2.hasError || apiv2.value.store === null || apiv2.value.store.storeType === "input") {
        return <div>Error</div>;
    }

    return <StaticFilterContainer filterStore={apiv2.value.store} multiselect={_props.multiSelect} />;
}
