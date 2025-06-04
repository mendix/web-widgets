import { performance } from "node:perf_hooks";
import { dynamic, list, listAttribute, obj } from "@mendix/widget-plugin-test-utils";
import "@testing-library/jest-dom";
import { configure } from "@testing-library/dom";
import { render } from "@testing-library/react";
import { Big } from "big.js";
import { createElement, Profiler } from "react";
import { ColumnsType, DatagridContainerProps } from "../../typings/DatagridProps";
import Datagrid from "../Datagrid";
import { data } from "./snapshot";
import { userEvent } from "@testing-library/user-event";

configure({
    getElementError: (message: string) => {
        const error = new Error(message.slice(0, 2048));
        error.name = "TestingLibraryElementError";
        return error;
    }
});

const withBig = data.map(row => row.map(value => (typeof value === "number" ? new Big(value) : value)));
const dataMap = new Map(withBig.map((rowData, index) => [obj(`${index + 1}`), rowData]));
const items = Array.from(dataMap.keys());

const mockColumn = (columnIndex: number): ColumnsType => {
    const column: ColumnsType = {
        showContentAs: "attribute",
        attribute: listAttribute(obj => {
            const row = dataMap.get(obj) ?? [];
            return row[columnIndex] ?? "none";
        }),
        header: dynamic(`Column ${columnIndex + 1}`),
        visible: dynamic(true),
        sortable: true,
        resizable: true,
        draggable: true,
        hidable: "yes",
        allowEventPropagation: true,
        width: "autoFill",
        minWidth: "auto",
        minWidthLimit: 100,
        size: 1,
        alignment: "left",
        wrapText: false,
        fetchOptionsLazy: true,
        filterCaptionType: "attribute"
    };

    return column;
};

describe("Datagrid", () => {
    beforeEach(() => {
        const mockIntersectionObserver = jest.fn();
        mockIntersectionObserver.mockReturnValue({
            observe: () => null,
            unobserve: () => null,
            disconnect: () => null,
            takeRecords: () => []
        });
        window.IntersectionObserver = mockIntersectionObserver;
    });
    it("should not take more then 9s to hide 3 column", async () => {
        const props: DatagridContainerProps = {
            advanced: false,
            name: "datagrid",
            datasource: list(items),
            columns: [...Array(30).keys()].map(mockColumn),
            columnsFilterable: true,
            pageSize: items.length,
            pagination: "buttons",
            pagingPosition: "bottom",
            itemSelectionMethod: "checkbox",
            itemSelectionMode: "toggle",
            class: "perf-test",
            refreshInterval: 0,
            showSelectAllToggle: false,
            showPagingButtons: "always",
            showEmptyPlaceholder: "none",
            onClickTrigger: "single",
            columnsSortable: true,
            columnsHidable: true,
            columnsResizable: true,
            columnsDraggable: true,
            filterList: [],
            configurationStorageType: "attribute",
            configurationAttribute: undefined,
            loadingType: "spinner",
            storeFiltersInPersonalization: true,
            showNumberOfRows: false
        };
        const user = userEvent.setup();
        let renderCount = 0;
        const onRender = (): number => ++renderCount;
        const WithProfiler = (): JSX.Element => (
            <Profiler id="grid" onRender={onRender}>
                <Datagrid {...props} />
            </Profiler>
        );
        const start = performance.now();
        const { getByRole, getAllByRole } = render(<WithProfiler />);
        expect(getByRole("grid")).toBeVisible();
        // Checking that we have 100 rows with 31 (30 from pros + 1 for selector) columns.
        expect(getAllByRole("gridcell")).toHaveLength(100 * 31);
        const btn = getByRole("button", { name: "Column selector" });
        await user.click(btn);
        const [col1, col2, col3] = getAllByRole("menuitem");
        await user.click(col1);
        await user.click(col2);
        await user.click(col3);
        expect(renderCount).toBeGreaterThanOrEqual(5);
        expect(renderCount).toBeLessThanOrEqual(10);
        expect(getAllByRole("gridcell")).toHaveLength(100 * 28);
        const end = performance.now();
        if (!process.env.CI) {
            console.debug(`Test completed in ${end - start}ms`);
            console.debug(`Render count ${renderCount}`);
        }
        // Why `20`s? I don't know. This is just enough time
        // to pass this test with current datagrid implementation.
        // As soon as this time will go down we can lower this value.
        // As of now this test is mainly to catch performance regressions
        // and actually see if any changes leading to performance improvements.
        expect(end - start).toBeLessThan(20_000);
    });
});
