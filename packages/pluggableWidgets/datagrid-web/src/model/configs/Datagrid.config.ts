import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { DatagridContainerProps, PagingPositionEnum } from "../../../typings/DatagridProps";

/** Config for static values that don't change at runtime. */
export interface DatagridConfig {
    checkboxColumnEnabled: boolean;
    filtersChannelName: string;
    id: string;
    name: string;
    refreshIntervalMs: number;
    selectAllCheckboxEnabled: boolean;
    selectionEnabled: boolean;
    selectorColumnEnabled: boolean;
    settingsStorageEnabled: boolean;
    enableSelectAll: boolean;
    keepSelection: boolean;
    pagingPosition: PagingPositionEnum;
}

export function datagridConfig(props: DatagridContainerProps): DatagridConfig {
    const id = `${props.name}:Datagrid@${generateUUID()}`;

    const config: DatagridConfig = {
        checkboxColumnEnabled: isCheckboxColumnEnabled(props),
        filtersChannelName: `${id}:events`,
        id,
        name: props.name,
        refreshIntervalMs: props.refreshInterval * 1000,
        selectAllCheckboxEnabled: props.showSelectAllToggle,
        selectionEnabled: isSelectionEnabled(props),
        selectorColumnEnabled: props.columnsHidable,
        settingsStorageEnabled: isSettingsStorageEnabled(props),
        enableSelectAll: props.enableSelectAll,
        keepSelection: props.keepSelection,
        pagingPosition: props.pagingPosition
    };

    return Object.freeze(config);
}

function isSelectionEnabled(props: DatagridContainerProps): boolean {
    return props.itemSelection !== undefined;
}

function isCheckboxColumnEnabled(props: DatagridContainerProps): boolean {
    if (!props.itemSelection) return false;
    return props.itemSelectionMethod === "checkbox";
}

function isSettingsStorageEnabled(props: DatagridContainerProps): boolean {
    if (props.configurationStorageType === "localStorage") return true;
    if (props.configurationStorageType === "attribute" && props.configurationAttribute) return true;
    return false;
}
