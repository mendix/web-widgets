import { DatagridContainerProps } from "./DatagridProps";

/** Type to declare props available through main gate. */
export type MainGateProps = Pick<
    DatagridContainerProps,
    | "allSelectedText"
    | "cancelExportLabel"
    | "cancelSelectionLabel"
    | "clearSelectionButtonLabel"
    | "columns"
    | "configurationAttribute"
    | "configurationStorageType"
    | "datasource"
    | "emptyPlaceholder"
    | "enableSelectAll"
    | "exportDialogLabel"
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
    | "selectRowLabel"
    | "showNumberOfRows"
    | "showPagingButtons"
    | "storeFiltersInPersonalization"
>;
