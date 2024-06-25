import { ObjectItem } from "mendix";
import { useEffect, useMemo } from "react";
import { ColumnsType } from "../../../../typings/DatagridProps";
import { DEFAULT_LIMIT } from "../constants";
import { CallbackFunction, Message, UpdateDataSourceFn } from "../types";
import { useExportMachine } from "./useExportMachine";

export const DATAGRID_DATA_EXPORT = "com.mendix.widgets.web.datagrid.export" as const;
const MAX_LIMIT = 500;
const _onOverwrite = Symbol("overwrite");

export type UseExportAPIProps = {
    columns: ColumnsType[];
    hasMoreItems: boolean;
    items?: ObjectItem[];
    name: string;
    offset: number;
    limit?: number;
    updateDataSource: UpdateDataSourceFn;
};

export type UseExportAPIReturn = {
    currentLimit: number;
    exporting: boolean;
    items: ObjectItem[];
    processedRows: number;
};

type UseExportAPIActions = {
    abort: () => void;
};

interface StreamOptions {
    limit: number;
}

interface DataExportStream {
    process(cb: (msg: Message) => Promise<void> | void, options?: StreamOptions): void;
    start(): void;
    abort(): void;
}

export interface DataExporter {
    create(): DataExportStream;
    [_onOverwrite]: () => void;
}

export const useDataExportApi = (props: UseExportAPIProps): [UseExportAPIReturn, UseExportAPIActions] => {
    const [result, dispatch] = useExportMachine(props);

    useEffect(() => {
        if (!window[DATAGRID_DATA_EXPORT]) {
            window[DATAGRID_DATA_EXPORT] = {};
        }

        if (!window.DATAGRID_DATA_EXPORT) {
            window.DATAGRID_DATA_EXPORT = "";
        }

        let isOverwrittenByOtherDatagrid = false;
        let isBusy = false;
        let dataExporterCleanup: (() => void) | undefined;
        const exporter: DataExporter = {
            create() {
                if (isBusy) {
                    throw new Error("Data grid (Export): export stream is busy");
                }

                let isReady = false;
                const dataExportStream: DataExportStream = {
                    process: (externalCallback: CallbackFunction, options) => {
                        const { limit = DEFAULT_LIMIT } = options ?? {};

                        const callback: CallbackFunction = msg => {
                            if (msg.type === "aborted" || msg.type === "end") {
                                isBusy = false;
                                isReady = false;
                            }
                            externalCallback(msg);
                        };

                        dispatch({
                            type: "Setup",
                            payload: { callback, columns: props.columns, limit: Math.min(limit, MAX_LIMIT) }
                        });

                        dataExporterCleanup = () => {
                            if (isBusy) {
                                callback({ type: "aborted" });
                            }
                        };

                        isReady = true;
                    },
                    start: () => {
                        if (isReady) {
                            dispatch({ type: "Start" });
                        } else {
                            throw new Error("Data grid (Export): can't start without handler.");
                        }
                    },
                    abort: () => {
                        dispatch({ type: "Abort" });
                    }
                };

                return dataExportStream;
            },
            [_onOverwrite]: (): void => {
                isOverwrittenByOtherDatagrid = true;
            }
        };

        const existingAPI = window[DATAGRID_DATA_EXPORT][props.name];

        if (existingAPI) {
            existingAPI[_onOverwrite]();
        }

        window[DATAGRID_DATA_EXPORT][props.name] = exporter;
        window.DATAGRID_DATA_EXPORT = DATAGRID_DATA_EXPORT;

        return () => {
            dataExporterCleanup?.();
            if (isOverwrittenByOtherDatagrid === false) {
                delete window[DATAGRID_DATA_EXPORT][props.name];
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const actions = useMemo(() => ({ abort: () => dispatch({ type: "Abort" }) }), [dispatch]);
    return [result, actions];
};
