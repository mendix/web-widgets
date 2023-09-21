import { Dispatch, SetStateAction } from "react";
import { ColumnWidthConfig, useSettings, SortingRule } from "../../features/settings";
import { EditableValueBuilder } from "@mendix/widget-plugin-test-utils";
import { renderHook, RenderHookResult } from "@testing-library/react";
import { EditableValue } from "mendix";
import { act } from "react-dom/test-utils";
import { GridColumn } from "../../typings/GridColumn";
import { column } from "../../utils/test-utils";
import { Column } from "../../helpers/Column";
import { ColumnsType } from "../../../typings/DatagridProps";

describe("useSettings Hook", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    it("loads correct values into hooks", () => {
        const props = mockProperties();

        renderHook(() =>
            useSettings(
                props.settings,
                props.columns,
                props.columnOrder,
                props.setColumnOrder,
                props.hiddenColumns,
                props.setHiddenColumns,
                props.sortBy,
                props.setSortBy,
                props.widths,
                props.setWidths
            )
        );
        expect(props.setColumnOrder).toHaveBeenCalledTimes(1);
        expect(props.setHiddenColumns).toHaveBeenCalledTimes(1);
        expect(props.setSortBy).toHaveBeenCalledTimes(1);
        expect(props.setWidths).toHaveBeenCalledTimes(1);
    });

    it("calls state functions with correct values", () => {
        const props = mockProperties();
        const columns = [
            column("Column 1", col => {
                col.hidable = "yes";
            }),
            column("Column 2", col => {
                col.hidable = "hidden";
            })
        ];
        const settings = new EditableValueBuilder<string>()
            .withValue(
                JSON.stringify([
                    {
                        column: "Column 1",
                        sort: true,
                        sortMethod: "desc",
                        hidden: false,
                        order: 1,
                        width: undefined
                    },
                    {
                        column: "Column 2",
                        sort: false,
                        sortMethod: "asc",
                        hidden: true,
                        order: 0,
                        width: 120
                    }
                ])
            )
            .build();

        renderHook(() =>
            useSettings(
                settings,
                columns.map(toColumn),
                props.columnOrder,
                props.setColumnOrder,
                props.hiddenColumns,
                props.setHiddenColumns,
                props.sortBy,
                props.setSortBy,
                props.widths,
                props.setWidths
            )
        );

        expect(props.setColumnOrder).toHaveBeenCalledTimes(1);
        expect(props.setHiddenColumns).toHaveBeenCalledTimes(1);
        expect(props.setSortBy).toHaveBeenCalledTimes(1);
        expect(props.setWidths).toHaveBeenCalledTimes(1);
    });

    it("changes the settings when some property changes", () => {
        const props = mockProperties();
        const { result, rerender } = renderUseSettingsHook(props);
        expect(props.settings.setValue).toHaveBeenCalledTimes(0);

        jest.advanceTimersByTime(100);

        rerender({
            ...props,
            columnOrder: [0],
            sortBy: [{ columnNumber: 0, desc: true }],
            widths: { "0": 130 }
        });

        result.current.updateSettings();

        expect(props.settings.setValue).toHaveBeenCalledWith(
            JSON.stringify([
                {
                    column: "Column 1",
                    sort: true,
                    sortMethod: "desc",
                    hidden: false,
                    order: 0,
                    width: 130
                }
            ])
        );
    });

    it("doesnt change the settings when same properties are applied", () => {
        const props = mockProperties();
        const initialProps = {
            settings: props.settings,
            columns: props.columns,
            columnOrder: [0],
            setColumnOrder: props.setColumnOrder,
            hiddenColumns: [],
            setHiddenColumns: props.setHiddenColumns,
            sortBy: [{ columnNumber: 0, desc: true }],
            setSortBy: props.setSortBy,
            widths: { "0": undefined } as ColumnWidthConfig,
            setWidths: props.setWidths
        };

        const { result, rerender } = renderUseSettingsHook(initialProps);
        expect(props.settings.setValue).toHaveBeenCalledTimes(0);
        rerender(initialProps);
        result.current.updateSettings();
        expect(props.settings.setValue).toHaveBeenCalledTimes(0);
    });

    it("doesnt change the hooks when same properties are applied", () => {
        const props = mockProperties();
        const initialProps = {
            settings: props.settings,
            columns: props.columns,
            columnOrder: [0],
            setColumnOrder: props.setColumnOrder,
            hiddenColumns: [],
            setHiddenColumns: props.setHiddenColumns,
            sortBy: [{ columnNumber: 0, desc: true }],
            setSortBy: props.setSortBy,
            widths: { "0": undefined } as ColumnWidthConfig,
            setWidths: props.setWidths
        };

        const { result, rerender } = renderUseSettingsHook(initialProps);
        // Initiates the hooks with values from settings once
        expect(props.setColumnOrder).toHaveBeenCalledTimes(1);
        expect(props.setHiddenColumns).toHaveBeenCalledTimes(1);
        expect(props.setSortBy).toHaveBeenCalledTimes(1);
        expect(props.setWidths).toHaveBeenCalledTimes(1);
        expect(props.settings.setValue).toHaveBeenCalledTimes(0);

        rerender({ ...initialProps });
        act(() => {
            result.current.updateSettings();
        });

        expect(props.setColumnOrder).toHaveBeenCalledTimes(1);
        expect(props.setHiddenColumns).toHaveBeenCalledTimes(1);
        expect(props.setSortBy).toHaveBeenCalledTimes(1);
        expect(props.setWidths).toHaveBeenCalledTimes(1);
        expect(props.settings.setValue).toHaveBeenCalledTimes(0);
    });

    it("applies changes to settings when receiving external changes", () => {
        const props = mockProperties();
        props.settings = new EditableValueBuilder<string>().withValue("").build();

        const { rerender, result } = renderUseSettingsHook(props);
        // Remains uncalled
        expect(props.settings.setValue).toHaveBeenCalledTimes(0);

        rerender({ ...props, sortBy: [{ columnNumber: 0, desc: false }] });
        act(() => {
            // Do not destructure or assign this to a variable earlier, because it's a mutable object and doing so will copy lock it,
            // which interferes with the `useCallback` memoization (https://react-hooks-testing-library.com/usage/basic-hooks#updates).
            result.current.updateSettings();
        });

        expect(props.settings.setValue).toHaveBeenCalledTimes(1);
        expect(props.settings.setValue).toHaveBeenCalledWith(
            JSON.stringify([{ column: "Column 1", sort: true, sortMethod: "asc", hidden: false, order: 0 }])
        );

        rerender({ ...props, sortBy: [{ columnNumber: 0, desc: true }] });
        act(() => {
            result.current.updateSettings();
        });

        expect(props.settings.setValue).toHaveBeenCalledTimes(2);
        expect(props.settings.setValue).toHaveBeenCalledWith(
            JSON.stringify([{ column: "Column 1", sort: true, sortMethod: "desc", hidden: false, order: 0 }])
        );
    });
});

type InitProps = {
    settings: EditableValue<string>;
    hiddenColumns: number[];
    columnOrder: number[];
    columns: any;
    setHiddenColumns: any;
    sortBy: Array<{ columnNumber: number; desc: boolean }>;
    widths: ColumnWidthConfig;
    setSortBy: any;
    setWidths: any;
    setColumnOrder: any;
};

function renderUseSettingsHook(initialProps: InitProps): RenderHookResult<{ updateSettings: () => void }, InitProps> {
    return renderHook(
        ({
            settings,
            columns,
            columnOrder,
            setColumnOrder,
            hiddenColumns,
            setHiddenColumns,
            sortBy,
            setSortBy,
            widths,
            setWidths
        }) =>
            useSettings(
                settings,
                columns,
                columnOrder,
                setColumnOrder,
                hiddenColumns,
                setHiddenColumns,
                sortBy,
                setSortBy,
                widths,
                setWidths
            ),
        {
            initialProps
        }
    );
}

function mockProperties(): {
    settings: EditableValue<string>;
    columns: GridColumn[];
    columnOrder: number[];
    setColumnOrder: Dispatch<SetStateAction<number[]>>;
    hiddenColumns: number[];
    setHiddenColumns: Dispatch<SetStateAction<number[]>>;
    sortBy: SortingRule[];
    setSortBy: Dispatch<SetStateAction<SortingRule[]>>;
    widths: ColumnWidthConfig;
    setWidths: Dispatch<SetStateAction<ColumnWidthConfig>>;
} {
    return {
        settings: new EditableValueBuilder<string>()
            .withValue(
                JSON.stringify([
                    {
                        column: "Column 1",
                        sort: true,
                        sortMethod: "desc",
                        hidden: false,
                        order: 0,
                        width: undefined
                    }
                ])
            )
            .build(),
        columns: [column("Column 1", col => (col.hidable = "yes"))].map(toColumn),
        columnOrder: [],
        setColumnOrder: jest.fn(),
        hiddenColumns: [],
        setHiddenColumns: jest.fn(),
        sortBy: [],
        setSortBy: jest.fn(),
        widths: { "0": undefined },
        setWidths: jest.fn()
    };
}

function toColumn(col: ColumnsType, index: number): Column {
    return new Column(col, index, "dg1");
}
