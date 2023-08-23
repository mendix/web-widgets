export const DATAGRID_DATA_EXPORT = "com.mendix.widgets.web.datagrid.export" as const;

interface DataExporter {
    create(): DataExportStream;
}

export type DataGridName = string;

declare global {
    interface Window {
        [DATAGRID_DATA_EXPORT]: Record<DataGridName, DataExporter>;
    }
}

export {};
