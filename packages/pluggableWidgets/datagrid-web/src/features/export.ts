import { useEffect, useState } from "react";
import { ListValue, ObjectItem } from "mendix";
import { isAvailable } from "@mendix/pluggable-widgets-commons";
import { ColumnsType } from "../../typings/DatagridProps";

export const DATAGRID_DATA_EXPORT = "com.mendix.widgets.web.datagrid.export" as const;

export interface DataExporter {
    create(): DataExportStream;
}

export type DataGridName = string;

type ColumnDefinition = {
    name: string;
    type: string;
};

type RowDataType = string | number | boolean;

export type Message =
    | {
          type: "columns";
          payload: ColumnDefinition[];
      }
    | {
          type: "data";
          payload: RowDataType[][];
      }
    | {
          type: "end";
      };

interface DataExportStream {
    process(cb: (msg: Message) => Promise<void> | void): void;
    start(): void;
    abort(): void;
}

type UseDG2ExportApi = {
    columns: ColumnsType[];
    datasource: ListValue;
    name: string;
    pageSize: number;
};

type UseExportAPIReturn = {
    items: ObjectItem[];
};

type CallbackFunction = (msg: Message) => Promise<void> | void;

export const useDG2ExportApi = ({ columns, datasource, name, pageSize }: UseDG2ExportApi): UseExportAPIReturn => {
    const [startProcess, setStartProcess] = useState(false);
    const [sentColumns, setSentColumns] = useState(false);
    const [callback, setCallback] = useState<CallbackFunction>();
    const [memoizedItems, setItems] = useState<ObjectItem[]>([]);

    const create = (): DataExportStream => {
        if (startProcess) {
            throw new Error("There is an export already in progress");
        }

        const dataExportStream: DataExportStream = {
            process: (cb: CallbackFunction) => {
                setCallback(() => cb);
            },
            start: () => setStartProcess(true),
            abort: () => {
                if (startProcess) {
                    setStartProcess(false);
                }
            }
        };

        return dataExportStream;
    };

    useEffect(() => {
        if (!window[DATAGRID_DATA_EXPORT]) {
            window[DATAGRID_DATA_EXPORT] = {};
        }

        window[DATAGRID_DATA_EXPORT][name] = { create };

        return () => {
            delete window[DATAGRID_DATA_EXPORT][name];
        };
    }, []);

    useEffect(() => {
        if (memoizedItems.length === 0 && datasource.items) {
            setItems(datasource.items);
        }
    }, [datasource.items]);

    useEffect(() => {
        if (startProcess) {
            const runColumnsCallback = async (): Promise<void> => {
                if (!callback) {
                    return;
                }
                await callback(exportColumns(columns));
                setSentColumns(true);
            };
            const runDataCallback = async (): Promise<void> => {
                if (!callback || !datasource.items) {
                    return;
                }

                if (datasource.items && datasource.hasMoreItems) {
                    await callback(exportData(datasource.items, columns));
                    datasource.setOffset(datasource.offset + pageSize);
                }

                if (datasource.items && datasource.hasMoreItems === false) {
                    await callback(exportData(datasource.items, columns));
                    callback({ type: "end" });
                    datasource.setOffset(0);
                    setStartProcess(false);
                }
            };

            if (sentColumns === false) {
                runColumnsCallback();
            }

            runDataCallback();
        }
    }, [callback, datasource.hasMoreItems, datasource.items, sentColumns, startProcess]);

    return { items: startProcess || datasource.offset > 0 ? memoizedItems : datasource.items ?? [] };
};

function exportColumns(columns: ColumnsType[]): Message {
    const exportColumns: ColumnDefinition[] = columns.map(column => ({
        name: column.header && isAvailable(column.header) ? column.header.value?.toString() ?? "" : "",
        type: column.attribute?.type.toString() ?? ""
    }));

    return { type: "columns", payload: exportColumns };
}

function exportData(data: ObjectItem[], columns: ColumnsType[]): Message {
    const items = data.map(item => {
        return columns.map(column => {
            let value = "";

            if (column.showContentAs === "attribute") {
                value = column.attribute?.get(item)?.displayValue ?? "";
            } else if (column.showContentAs === "dynamicText") {
                value = column.dynamicText?.get(item)?.value ?? "";
            } else {
                value = "n/a";
            }

            return value;
        });
    });

    return { type: "data", payload: items };
}
