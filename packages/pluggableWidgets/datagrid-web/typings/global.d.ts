import { DATAGRID_DATA_EXPORT, DataExporter, DataGridName } from "../src/features/data-export"

declare global {
    interface Window {
        [DATAGRID_DATA_EXPORT]: Record<DataGridName, DataExporter>;
        DATAGRID_DATA_EXPORT: string;
    }
}

export {};
