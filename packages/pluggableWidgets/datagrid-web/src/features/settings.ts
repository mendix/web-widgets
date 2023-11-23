import { Dispatch, SetStateAction, useCallback, useEffect, useRef } from "react";
import { EditableValue, ValueStatus } from "mendix";
import { useEventCallback } from "@mendix/widget-plugin-hooks/useEventCallback";
import { GridColumn } from "../typings/GridColumn";

declare type Option<T> = T | undefined;

interface Settings {
    columnOrder: number[];
    hiddenColumns: number[];
    sortBy: SortingRule[];
    widths: ColumnWidthConfig;
}

interface PersistedSettings {
    column: string;
    sort: boolean;
    sortMethod: "asc" | "desc";
    hidden: boolean;
    order: number;
    width: number | undefined;
}

export interface SortingRule {
    columnNumber: number;
    desc: boolean;
}

export interface ColumnWidthConfig {
    [columnNumber: string]: number | undefined;
}

export function createSettings(
    { columnOrder, hiddenColumns, sortBy, widths }: Settings,
    columns: GridColumn[]
): PersistedSettings[] {
    return columns.map(column => {
        const columnIndex = columnOrder.findIndex(o => o === column.columnNumber);
        return {
            column: column.header,
            sort: !!sortBy.find(s => s.columnNumber === column.columnNumber),
            sortMethod: sortBy.find(s => s.columnNumber === column.columnNumber)?.desc ? "desc" : "asc",
            hidden: hiddenColumns.includes(column.columnNumber),
            order: columnIndex > -1 ? columnIndex : column.columnNumber,
            width: widths[column.columnNumber]
        };
    });
}

export function useSettings(
    settings: Option<EditableValue<string>>,
    columns: GridColumn[],
    columnOrder: number[],
    setColumnOrder: Dispatch<SetStateAction<number[]>>,
    hiddenColumns: number[],
    setHiddenColumns: Dispatch<SetStateAction<number[]>>,
    sortBy: SortingRule[],
    setSortBy: Dispatch<SetStateAction<SortingRule[]>>,
    widths: ColumnWidthConfig,
    setWidths: Dispatch<SetStateAction<ColumnWidthConfig>>
): { updateSettings: () => void } {
    const previousLoadedSettings = useRef<string>();
    const shouldUpdate = useRef(true);

    const setColumnOrderStable = useEventCallback(setColumnOrder);
    const setHiddenColumnsStable = useEventCallback(setHiddenColumns);
    const setSortByStable = useEventCallback(setSortBy);
    const setWidthsStable = useEventCallback(setWidths);
    const prevSettings = previousLoadedSettings.current;
    useEffect(() => {
        if (settings && settings.status !== ValueStatus.Loading && settings.value && settings.value !== prevSettings) {
            const newSettings = JSON.parse(settings.value) as PersistedSettings[];
            const columnsSettings = newSettings.map(columnSettings => ({
                ...columnSettings,
                columnNumber: columns.find(c => c.header === columnSettings.column)?.columnNumber ?? -1
            }));

            const extractedSettings: Settings = {
                columnOrder: columnsSettings.sort((a, b) => a.order - b.order).map(s => s.columnNumber),
                hiddenColumns: columnsSettings.filter(s => s.hidden).map(s => s.columnNumber),
                sortBy: columnsSettings
                    .filter(s => s.sort)
                    .map(s => ({
                        columnNumber: s.columnNumber,
                        desc: s.sortMethod === "desc"
                    })),
                widths: Object.fromEntries(columnsSettings.map(s => [s.columnNumber, s.width]))
            };

            previousLoadedSettings.current = settings.value;

            // Avoid settings to be saved if the value changes from the database or dataview around.
            shouldUpdate.current = false;

            setColumnOrderStable(prev => setValue(prev, extractedSettings.columnOrder));
            setHiddenColumnsStable(prev => setValue(prev, extractedSettings.hiddenColumns));
            setSortByStable(prev => setValue(prev, extractedSettings.sortBy));
            setWidthsStable(prev => setValue(prev, extractedSettings.widths));

            setTimeout(() => {
                shouldUpdate.current = true;
            }, 100);
        }
    }, [
        settings,
        columns,
        prevSettings,
        setColumnOrderStable,
        setHiddenColumnsStable,
        setSortByStable,
        setWidthsStable
    ]);

    const updateSettings = useCallback(() => {
        if (settings && settings.status === ValueStatus.Available && shouldUpdate.current) {
            const newSettings = JSON.stringify(
                createSettings(
                    {
                        columnOrder,
                        hiddenColumns,
                        sortBy,
                        widths
                    },
                    columns
                ) ?? []
            );
            if (previousLoadedSettings.current !== newSettings && settings.value !== newSettings) {
                settings.setValue(newSettings);
                previousLoadedSettings.current = newSettings;
            }
        }
    }, [settings, columnOrder, hiddenColumns, sortBy, widths, columns]);

    return { updateSettings };
}

function setValue<T>(previous: T, current: T): T {
    if (JSON.stringify(previous) === JSON.stringify(current)) {
        return previous;
    }
    return current;
}
