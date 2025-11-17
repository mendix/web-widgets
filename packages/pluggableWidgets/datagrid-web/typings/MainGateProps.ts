import { DatagridContainerProps } from "./DatagridProps";

/** Type to declare props available through main gate. */
export type MainGateProps = Pick<
    DatagridContainerProps,
    | "allSelectedText"
    | "cancelSelectionLabel"
    | "clearSelectionButtonLabel"
    | "columns"
    | "configurationAttribute"
    | "configurationStorageType"
    | "datasource"
    | "emptyPlaceholder"
    | "enableSelectAll"
    | "itemSelection"
    | "name"
    | "onSelectionChange"
    | "pageSize"
    | "pagination"
    | "refreshIndicator"
    | "refreshInterval"
    | "selectAllRowsLabel"
    | "selectAllTemplate"
    | "selectAllText"
    | "selectionCounterPosition"
    | "showNumberOfRows"
    | "showPagingButtons"
    | "storeFiltersInPersonalization"
>;
