jest.mock("mendix", () => ({}), { virtual: true });

import { act, renderHook } from "@testing-library/react";
import { actionValue, list } from "@mendix/widget-plugin-test-utils";
import { TaskProgressService } from "@mendix/widget-plugin-grid/main";
import { IColumnGroupStore } from "../../../helpers/state/ColumnGroupStore";
import { useDataExport } from "../useDataExport";
import { getExportRegistry } from "../registry";
import type { AfterExportArgs, BeforeExportArgs } from "../ExportController";
import Big from "big.js";

function makeMockProgress(): TaskProgressService {
    return {
        inProgress: false,
        lengthComputable: false,
        loaded: 0,
        total: 0,
        onloadstart: jest.fn(),
        onprogress: jest.fn(),
        onloadend: jest.fn()
    };
}

function makeColumnsStore(): IColumnGroupStore {
    return {
        loaded: true,
        availableColumns: [],
        visibleColumns: [],
        columnFilters: [],
        swapColumns: jest.fn(),
        setIsResizing: jest.fn()
    };
}

const GRID_NAME = "test-grid";

const BEFORE_ARGS: BeforeExportArgs = {
    gridName: GRID_NAME,
    columnTitles: "Col1,Col2",
    chunkSize: 100,
    fileName: "export.xlsx",
    sheetName: "Sheet1",
    startTime: new Date("2026-01-01T00:00:00Z")
};

const AFTER_ARGS: AfterExportArgs = {
    ...BEFORE_ARGS,
    exportedItemCount: 42,
    status: "success",
    endTime: new Date("2026-01-01T00:01:00Z")
};

describe("useDataExport subscription wiring", () => {
    afterEach(() => {
        jest.clearAllMocks();
        getExportRegistry().clear();
    });

    function renderExportHook(overrides?: {
        onBeforeExport?: ReturnType<typeof actionValue>;
        onAfterExport?: ReturnType<typeof actionValue>;
    }) {
        const columnsStore = makeColumnsStore();
        const progress = makeMockProgress();
        return renderHook(() =>
            useDataExport(
                {
                    name: GRID_NAME,
                    datasource: list(0),
                    columns: [],
                    onBeforeExport: overrides?.onBeforeExport,
                    onAfterExport: overrides?.onAfterExport
                },
                columnsStore,
                progress
            )
        );
    }

    it("calls onBeforeExport.execute with correct payload when canExecute is true", () => {
        const action = actionValue(true);
        renderExportHook({ onBeforeExport: action });

        const controller = getExportRegistry().get(GRID_NAME)!;
        act(() => {
            controller.emit("beforeexport", BEFORE_ARGS);
        });

        expect(action.execute).toHaveBeenCalledTimes(1);
        expect(action.execute).toHaveBeenCalledWith({
            gridName: GRID_NAME,
            columnTitles: "Col1,Col2",
            chunkSize: new Big(100),
            fileName: "export.xlsx",
            sheetName: "Sheet1",
            startTime: BEFORE_ARGS.startTime
        });
    });

    it("does not call onBeforeExport.execute when canExecute is false", () => {
        const action = actionValue(false);
        renderExportHook({ onBeforeExport: action });

        const controller = getExportRegistry().get(GRID_NAME)!;
        act(() => {
            controller.emit("beforeexport", BEFORE_ARGS);
        });

        expect(action.execute).not.toHaveBeenCalled();
    });

    it("calls onAfterExport.execute with correct payload on success", () => {
        const action = actionValue(true);
        renderExportHook({ onAfterExport: action });

        const controller = getExportRegistry().get(GRID_NAME)!;
        act(() => {
            controller.emit("afterexport", AFTER_ARGS);
        });

        expect(action.execute).toHaveBeenCalledTimes(1);
        expect(action.execute).toHaveBeenCalledWith({
            gridName: GRID_NAME,
            columnTitles: "Col1,Col2",
            chunkSize: new Big(100),
            fileName: "export.xlsx",
            sheetName: "Sheet1",
            exportedItemCount: new Big(42),
            status: "success",
            startTime: AFTER_ARGS.startTime,
            endTime: AFTER_ARGS.endTime
        });
    });

    it("does not call onAfterExport.execute when canExecute is false", () => {
        const action = actionValue(false);
        renderExportHook({ onAfterExport: action });

        const controller = getExportRegistry().get(GRID_NAME)!;
        act(() => {
            controller.emit("afterexport", AFTER_ARGS);
        });

        expect(action.execute).not.toHaveBeenCalled();
    });

    it("unsubscribes on unmount — no calls after the component is removed", () => {
        const action = actionValue(true);
        const { unmount } = renderExportHook({ onBeforeExport: action });

        const controller = getExportRegistry().get(GRID_NAME)!;
        unmount();

        act(() => {
            controller.emit("beforeexport", BEFORE_ARGS);
        });

        expect(action.execute).not.toHaveBeenCalled();
    });

    it("reads the latest ActionValue from ref without resubscribing", () => {
        const firstAction = actionValue(true);
        const secondAction = actionValue(true);
        const columnsStore = makeColumnsStore();
        const progress = makeMockProgress();

        const { rerender } = renderHook(
            ({ onBeforeExport }: { onBeforeExport: ReturnType<typeof actionValue> }) =>
                useDataExport(
                    { name: GRID_NAME, datasource: list(0), columns: [], onBeforeExport, onAfterExport: undefined },
                    columnsStore,
                    progress
                ),
            { initialProps: { onBeforeExport: firstAction } }
        );

        rerender({ onBeforeExport: secondAction });

        const controller = getExportRegistry().get(GRID_NAME)!;
        act(() => {
            controller.emit("beforeexport", BEFORE_ARGS);
        });

        expect(firstAction.execute).not.toHaveBeenCalled();
        expect(secondAction.execute).toHaveBeenCalledTimes(1);
    });
});
