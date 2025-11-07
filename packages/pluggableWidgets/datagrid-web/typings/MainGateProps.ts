import { DatagridContainerProps } from "./DatagridProps";

/** Type to declare props available through main gate. */
export type MainGateProps = Pick<
    DatagridContainerProps,
    | "name"
    | "datasource"
    | "refreshInterval"
    | "refreshIndicator"
    | "itemSelection"
    | "columns"
    | "configurationStorageType"
    | "storeFiltersInPersonalization"
    | "configurationAttribute"
    | "pageSize"
    | "pagination"
    | "showPagingButtons"
    | "showNumberOfRows"
    | "clearSelectionButtonLabel"
    | "selectAllTemplate"
    | "selectAllText"
    | "itemSelection"
    | "datasource"
    | "allSelectedText"
    | "selectAllRowsLabel"
    | "cancelSelectionLabel"
    | "selectionCounterPosition"
    | "enableSelectAll"
    | "emptyPlaceholder"
>;
