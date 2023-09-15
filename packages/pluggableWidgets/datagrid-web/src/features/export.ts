import { useEffect, useState } from "react";
import { ObjectItem } from "mendix";
import { isAvailable } from "@mendix/widget-plugin-platform/framework/is-available";
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
    hasMoreItems: boolean;
    items?: ObjectItem[];
    name: string;
    offset: number;
    pageSize: number;
    setOffset: (offset: number) => void;
};

type UseExportAPIReturn = {
    items: ObjectItem[];
};

type CallbackFunction = (msg: Message) => Promise<void> | void;

export const useDG2ExportApi = ({
    columns,
    hasMoreItems,
    items,
    name,
    offset,
    pageSize,
    setOffset
}: UseDG2ExportApi): UseExportAPIReturn => {
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
        if (memoizedItems.length === 0 && items) {
            setItems(items);
        }
    }, [memoizedItems.length, items]);

    useEffect(() => {
        if (startProcess) {
            const runColumnsCallback = async (): Promise<void> => {
                if (!callback) {
                    return;
                }
                const datagridColumns = exportColumns(columns);
                await callback(datagridColumns);
                setSentColumns(true);
            };
            const runDataCallback = async (): Promise<void> => {
                if (!callback || !items) {
                    return;
                }

                if (items && hasMoreItems) {
                    await callback(exportData(items, columns));
                    setOffset(offset + pageSize);
                }

                if (items && hasMoreItems === false) {
                    await callback(exportData(items, columns));
                    await callback({ type: "end" });
                    setOffset(0);
                    setStartProcess(false);
                }
            };

            if (sentColumns === false) {
                runColumnsCallback();
            } else {
                runDataCallback();
            }
        }
    }, [callback, columns, hasMoreItems, items, sentColumns, startProcess]);

    const exporting = items !== memoizedItems ? true : startProcess;
    return { items: exporting ? memoizedItems : items ?? [] };
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
