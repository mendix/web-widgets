import { ListAttributeValue, ListValue } from "mendix";
import { dynamic, listAttribute, ListValueBuilder } from "@mendix/widget-plugin-test-utils";
import { ColumnsType, DatagridContainerProps } from "../../../../typings/DatagridProps";
import { MainGateProps } from "../../../../typings/MainGateProps";
import { column, mockContainerProps } from "../../../__tests__/test-utils";
import { createDatagridContainer } from "../../../createDatagridContainer";
import { MainGateProvider } from "../../core/services/MainGateProvider.service";
import { CORE_TOKENS as CORE } from "../../core/tokens";
import { COLUMNS_TOKENS as COLUMNS, ColumnGroupStore, ColumnId } from "../tokens";

interface Grid {
    store: ColumnGroupStore;
    mainProvider: MainGateProvider<MainGateProps>;
    dispose: () => void;
}

function setupGrid(props: DatagridContainerProps): Grid {
    const [container, , mainProvider] = createDatagridContainer(props);
    const store = container.get(COLUMNS.columnsStore);
    const dispose = container.get(CORE.setupService).setup();
    return { store, mainProvider, dispose };
}

const headers = (columns: Array<{ header: string }>): string[] => columns.map(c => c.header);
const id = (index: number): ColumnId => String(index) as ColumnId;

const sortableColumn = (header: string, attrId: string): ColumnsType =>
    column(header, c => {
        c.sortable = true;
        c.attribute = listAttribute(() => "value", attrId as ListAttributeValue["id"]);
    });

const sortedList = (sortOrder: ListValue["sortOrder"]): ListValue =>
    new ListValueBuilder().withSize(5).withSortOrder(sortOrder).build();

describe("ColumnGroupStore", () => {
    let dispose: () => void;
    afterEach(() => dispose?.());

    describe("available and visible columns", () => {
        it("excludes columns hidden by their visibility expression from available columns", () => {
            const grid = setupGrid(
                mockContainerProps({
                    columns: [column("A"), column("B", c => (c.visible = dynamic.available(false))), column("C")]
                })
            );
            dispose = grid.dispose;

            expect(headers(grid.store.availableColumns)).toEqual(["A", "C"]);
            expect(headers(grid.store.visibleColumns)).toEqual(["A", "C"]);
        });

        it("keeps initially hidden columns available but not visible", () => {
            const grid = setupGrid(
                mockContainerProps({
                    columns: [column("A"), column("B", c => (c.hidable = "hidden")), column("C")]
                })
            );
            dispose = grid.dispose;

            expect(headers(grid.store.availableColumns)).toEqual(["A", "B", "C"]);
            expect(headers(grid.store.visibleColumns)).toEqual(["A", "C"]);
        });

        it("reflects hidable settings on each column", () => {
            const grid = setupGrid(
                mockContainerProps({
                    columns: [
                        column("A", c => (c.hidable = "no")),
                        column("B", c => (c.hidable = "yes")),
                        column("C", c => (c.hidable = "hidden"))
                    ]
                })
            );
            dispose = grid.dispose;

            expect(grid.store.availableColumns.map(c => [c.canHide, c.isHidden, c.initiallyHidden])).toEqual([
                [false, false, false],
                [true, false, false],
                [true, true, true]
            ]);
        });

        it("hides and shows a column on toggle", () => {
            const grid = setupGrid(
                mockContainerProps({ columns: [column("A"), column("B", c => (c.hidable = "yes"))] })
            );
            dispose = grid.dispose;
            const [, b] = grid.store.availableColumns;

            b.toggleHidden();
            expect(headers(grid.store.visibleColumns)).toEqual(["A"]);

            b.toggleHidden();
            expect(headers(grid.store.visibleColumns)).toEqual(["A", "B"]);
        });

        it("updates available columns when a visibility expression changes", () => {
            const props = mockContainerProps({ columns: [column("A"), column("B")] });
            const grid = setupGrid(props);
            dispose = grid.dispose;

            grid.mainProvider.setProps({
                ...props,
                columns: [column("A"), column("B", c => (c.visible = dynamic.available(false)))]
            });

            expect(headers(grid.store.availableColumns)).toEqual(["A"]);
        });

        it("is not loaded while a visibility expression is loading for the first time", () => {
            const grid = setupGrid(
                mockContainerProps({ columns: [column("A"), column("B", c => (c.visible = dynamic.loading()))] })
            );
            dispose = grid.dispose;

            expect(grid.store.loaded).toBe(false);
        });

        it("is loaded when every visibility expression has a value", () => {
            const grid = setupGrid(mockContainerProps({ columns: [column("A"), column("B")] }));
            dispose = grid.dispose;

            expect(grid.store.loaded).toBe(true);
        });
    });

    describe("last visible column", () => {
        const props = (): DatagridContainerProps =>
            mockContainerProps({
                columns: [column("A", c => (c.hidable = "yes")), column("B", c => (c.hidable = "yes"))]
            });

        it("marks only the last visible column as last", () => {
            const grid = setupGrid(props());
            dispose = grid.dispose;
            const [a, b] = grid.store._allColumns;

            expect(grid.store.isLastVisible(b)).toBe(true);
            expect(grid.store.isLastVisible(a)).toBe(false);

            b.toggleHidden();
            expect(grid.store.isLastVisible(a)).toBe(true);
        });

        it("current behaviour: the store lets the last visible column be hidden until the next props update", () => {
            const p = props();
            const grid = setupGrid(p);
            dispose = grid.dispose;
            const [a, b] = grid.store._allColumns;

            a.toggleHidden();
            b.toggleHidden();
            expect(grid.store.visibleColumns).toEqual([]);

            grid.mainProvider.setProps({ ...p });
            expect(headers(grid.store.visibleColumns)).toEqual(["A", "B"]);
        });

        it("shows all columns again when a props update leaves none visible", () => {
            const grid = setupGrid(props());
            dispose = grid.dispose;

            grid.mainProvider.setProps(
                mockContainerProps({
                    columns: [
                        column("A", c => (c.visible = dynamic.available(false))),
                        column("B", c => (c.hidable = "hidden"))
                    ]
                })
            );

            expect(headers(grid.store.visibleColumns)).toEqual(["B"]);
        });

        it("does not let the last visible column resize", () => {
            const grid = setupGrid(
                mockContainerProps({
                    columns: [column("A", c => (c.resizable = true)), column("B", c => (c.resizable = true))]
                })
            );
            dispose = grid.dispose;

            expect(grid.store.visibleColumns.map(c => c.canResize)).toEqual([true, false]);
        });
    });

    describe("swapColumns", () => {
        const threeColumns = (): DatagridContainerProps =>
            mockContainerProps({ columns: [column("A"), column("B"), column("C")] });

        it("moves a column after the target", () => {
            const grid = setupGrid(threeColumns());
            dispose = grid.dispose;

            grid.store.swapColumns(id(0), [id(2), "after"]);

            expect(headers(grid.store.visibleColumns)).toEqual(["B", "C", "A"]);
        });

        it("moves a column before the target", () => {
            const grid = setupGrid(threeColumns());
            dispose = grid.dispose;

            grid.store.swapColumns(id(2), [id(0), "before"]);

            expect(headers(grid.store.visibleColumns)).toEqual(["C", "A", "B"]);
        });

        it("keeps the order stable across several swaps", () => {
            const grid = setupGrid(threeColumns());
            dispose = grid.dispose;

            grid.store.swapColumns(id(0), [id(1), "after"]);
            grid.store.swapColumns(id(2), [id(1), "before"]);
            grid.store.swapColumns(id(0), [id(2), "before"]);

            expect(headers(grid.store.visibleColumns)).toEqual(["A", "C", "B"]);
        });

        it("keeps hidden columns in place in the available order", () => {
            const grid = setupGrid(
                mockContainerProps({ columns: [column("A"), column("B", c => (c.hidable = "hidden")), column("C")] })
            );
            dispose = grid.dispose;

            grid.store.swapColumns(id(2), [id(0), "before"]);

            expect(headers(grid.store.availableColumns)).toEqual(["C", "A", "B"]);
            expect(headers(grid.store.visibleColumns)).toEqual(["C", "A"]);
        });
    });

    describe("sorting", () => {
        it("toggles a column asc, desc, then off and exposes it as sort instructions", () => {
            const grid = setupGrid(mockContainerProps({ columns: [sortableColumn("A", "attrA"), column("B")] }));
            dispose = grid.dispose;
            const [a] = grid.store.visibleColumns;

            a.toggleSort();
            expect([a.sortDir, a.sortWeight]).toEqual(["asc", 1]);
            expect(grid.store.sortInstructions).toEqual([["attrA", "asc"]]);

            a.toggleSort();
            expect([a.sortDir, a.sortWeight]).toEqual(["desc", 1]);
            expect(grid.store.sortInstructions).toEqual([["attrA", "desc"]]);

            a.toggleSort();
            expect([a.sortDir, a.sortWeight]).toEqual([undefined, undefined]);
            expect(grid.store.sortInstructions).toBeUndefined();
        });

        it("reads the initial multi-column sort from the datasource", () => {
            const props = mockContainerProps({
                columns: [sortableColumn("A", "attrA"), sortableColumn("B", "attrB"), sortableColumn("C", "attrC")]
            });
            props.datasource = sortedList([
                ["attrC" as ListAttributeValue["id"], "desc"],
                ["attrA" as ListAttributeValue["id"], "asc"]
            ]);
            const grid = setupGrid(props);
            dispose = grid.dispose;

            expect(grid.store.visibleColumns.map(c => [c.sortDir, c.sortWeight])).toEqual([
                ["asc", 2],
                [undefined, undefined],
                ["desc", 1]
            ]);
            expect(grid.store.sortInstructions).toEqual([
                ["attrC", "desc"],
                ["attrA", "asc"]
            ]);
        });

        it("ignores datasource sort on attributes that no column shows", () => {
            const props = mockContainerProps({ columns: [sortableColumn("A", "attrA")] });
            props.datasource = sortedList([["other" as ListAttributeValue["id"], "asc"]]);
            const grid = setupGrid(props);
            dispose = grid.dispose;

            expect(grid.store.sortInstructions).toBeUndefined();
        });

        it("replaces a multi-column sort when a column is toggled", () => {
            const props = mockContainerProps({
                columns: [sortableColumn("A", "attrA"), sortableColumn("B", "attrB")]
            });
            props.datasource = sortedList([
                ["attrA" as ListAttributeValue["id"], "asc"],
                ["attrB" as ListAttributeValue["id"], "asc"]
            ]);
            const grid = setupGrid(props);
            dispose = grid.dispose;

            grid.store.visibleColumns[1].toggleSort();

            expect(grid.store.sortInstructions).toEqual([["attrB", "asc"]]);
        });

        it("can sort only columns that are sortable and have a sortable attribute", () => {
            const grid = setupGrid(
                mockContainerProps({
                    columns: [
                        sortableColumn("A", "attrA"),
                        column("B"),
                        column("C", c => {
                            c.sortable = true;
                            c.attribute = undefined;
                        })
                    ]
                })
            );
            dispose = grid.dispose;

            expect(grid.store.visibleColumns.map(c => c.canSort)).toEqual([true, false, false]);
        });
    });
});
