import { useEffect, useState } from "react";
import { ListValue, ObjectItem } from "mendix";
import { isAvailable } from "@mendix/pluggable-widgets-commons";
import { ColumnsType } from "../../typings/DatagridProps";
import { DATAGRID_DATA_EXPORT } from "../../typings/global";

// Roman types ideas
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
// Roman types ideas

type UseDG2ExportApi = {
    columns: ColumnsType[];
    datasource: ListValue;
    name: string;
    pageSize: number;
};

type CallbackFunction = (msg: Message) => Promise<void> | void;

export const useDG2ExportApi = ({ columns, datasource, name, pageSize }: UseDG2ExportApi) => {
    const [startProcess, setStartProcess] = useState(false);
    const [sentColumns, setSentColumns] = useState(false);
    const [callback, setCallback] = useState<CallbackFunction>();

    const dataExportStream: DataExportStream = {
        process: (cb: CallbackFunction) => {
            setCallback(() => cb);
        },
        start: () => setStartProcess(true),
        abort: () => {
            if (callback) {
                callback({ type: "end" });
            }
            if (startProcess) {
                setStartProcess(false);
            }
        }
    };

    const create = (): DataExportStream => {
        return dataExportStream;
    };

    const exportColumns = (): Message => {
        const exportColumns: ColumnDefinition[] = columns.map(column => ({
            name: column.header && isAvailable(column.header) ? column.header.value?.toString() ?? "" : "",
            type: column.attribute?.type.toString() ?? ""
        }));

        return { type: "columns", payload: exportColumns };
    };

    const exportData = (data: ObjectItem[]): Message => {
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
    };

    useEffect(() => {
        if (!window[DATAGRID_DATA_EXPORT]) {
            window[DATAGRID_DATA_EXPORT] = {};
        }

        window[DATAGRID_DATA_EXPORT][name] = { create };
    }, []);

    useEffect(() => {
        if (startProcess && callback) {
            if (sentColumns === false) {
                callback(exportColumns());
                setSentColumns(true);
            }

            if (datasource.items && datasource.hasMoreItems) {
                callback(exportData(datasource.items));
                const newOffset = datasource.offset + pageSize;
                datasource.setOffset(newOffset);
            }

            if (datasource.items && datasource.hasMoreItems === false) {
                callback(exportData(datasource.items));
                callback({ type: "end" });
                datasource.setOffset(0);
                setStartProcess(false);
            }
        }
    }, [callback, datasource.hasMoreItems, datasource.items, sentColumns, startProcess]);
};
