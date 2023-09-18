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
    exporting: boolean;
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
    const [exporting, setExporting] = useState(false);
    const [finished, setFinished] = useState(false);
    const [sentColumns, setSentColumns] = useState(false);
    const [callback, setCallback] = useState<CallbackFunction>();
    const [memoizedItems, setMemoizedItems] = useState<ObjectItem[]>([]);
    const [resetOffset, setResetOffset] = useState(false);
    const [initialOffset, setInitialOffset] = useState<number | undefined>();

    const create = (): DataExportStream => {
        if (exporting) {
            throw new Error("There is an export already in progress");
        }

        const dataExportStream: DataExportStream = {
            process: (cb: CallbackFunction) => setCallback(() => cb),
            start: () => setExporting(true),
            abort: () => {
                if (exporting) {
                    setFinished(true);
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
        if (exporting) {
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

                if (hasMoreItems) {
                    await callback(exportData(items, columns));
                    setOffset(offset + pageSize);
                } else {
                    await callback(exportData(items, columns));
                    await callback({ type: "end" });
                    setFinished(true);
                }
            };

            if (initialOffset === undefined) {
                setInitialOffset(offset);
            }

            if (memoizedItems.length === 0 && offset === initialOffset) {
                setMemoizedItems(items!);
            }

            if (resetOffset === false) {
                if (offset > 0) {
                    setOffset(0);
                } else {
                    setResetOffset(true);
                }
            } else {
                if (sentColumns === false) {
                    runColumnsCallback();
                } else {
                    runDataCallback();
                }
            }
        }
    }, [
        callback,
        columns,
        exporting,
        hasMoreItems,
        initialOffset,
        items,
        memoizedItems.length,
        offset,
        resetOffset,
        sentColumns
    ]);

    useEffect(() => {
        if (finished) {
            console.info({ offset, initialOffset });
            if (offset === initialOffset) {
                setExporting(false);
                setResetOffset(false);
                setInitialOffset(undefined);
                setFinished(false);
            } else {
                setOffset(initialOffset || 0);
            }
        }
    }, [offset, finished]);

    return {
        exporting: exporting,
        items: exporting ? memoizedItems : items ?? []
    };
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
