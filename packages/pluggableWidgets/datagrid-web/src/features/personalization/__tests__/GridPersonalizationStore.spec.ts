import { EditableValue, ListAttributeValue, ListValue } from "mendix";
import { FilterData } from "@mendix/filter-commons/typings/settings";
import { CustomFilterHost } from "@mendix/widget-plugin-filtering/stores/generic/CustomFilterHost";
import { dynamic, editable, listAttribute, ListValueBuilder } from "@mendix/widget-plugin-test-utils";
import { ColumnsType, DatagridContainerProps } from "../../../../typings/DatagridProps";
import { column, mockContainerProps } from "../../../__tests__/test-utils";
import { createDatagridContainer } from "../../../createDatagridContainer";
import { COLUMNS_TOKENS as COLUMNS, ColumnGroupStore, ColumnId, SortInstruction } from "../../columns/tokens";
import { CORE_TOKENS as CORE } from "../../core/tokens";
import { DATASOURCE_TOKENS as DATASOURCE } from "../../datasource/tokens";

const WRITE_DELAY_MS = 250;

const id = (index: number): ColumnId => String(index) as ColumnId;

const gridColumn = (header: string, patch?: (c: ColumnsType) => void): ColumnsType =>
    column(header, c => {
        c.sortable = true;
        c.hidable = "yes";
        c.draggable = true;
        c.resizable = true;
        c.attribute = { ...listAttribute(() => "value", `attr${header}` as ListAttributeValue["id"]), isList: false };
        patch?.(c);
    });

const gridProps = (overrides: Partial<DatagridContainerProps> = {}): DatagridContainerProps =>
    mockContainerProps({
        columns: [gridColumn("A"), gridColumn("B"), gridColumn("C")],
        configurationStorageType: "attribute",
        configurationAttribute: editable<string>(),
        ...overrides
    });

interface Grid {
    columns: ColumnGroupStore;
    filterHost: CustomFilterHost;
    dispose: () => void;
}

interface GridState {
    visible: string[];
    available: string[];
    sizes: Array<number | undefined>;
    sort: SortInstruction[] | undefined;
    filters: Array<[ColumnId, FilterData]>;
}

function setupGrid(props: DatagridContainerProps): Grid {
    const [container] = createDatagridContainer(props);
    const columns = container.get(COLUMNS.columnsStore);
    const filterHost = container.get(DATASOURCE.filterHost);
    const dispose = container.get(CORE.setupService).setup();
    return { columns, filterHost, dispose };
}

function gridState({ columns }: Grid): GridState {
    return {
        visible: columns.visibleColumns.map(c => c.header),
        available: columns.availableColumns.map(c => c.header),
        sizes: columns.availableColumns.map(c => c.size),
        sort: columns.sortInstructions,
        filters: [...columns.filterSettings]
    };
}

function storedJson(attr: EditableValue<string> | undefined): string {
    if (!attr?.value) {
        throw new Error("Expected settings to be written to the attribute");
    }
    return attr.value;
}

const sortedList = (sortOrder: ListValue["sortOrder"]): ListValue =>
    new ListValueBuilder().withSize(5).withSortOrder(sortOrder).build();

describe("GridPersonalizationStore", () => {
    const grids: Grid[] = [];
    const open = (props: DatagridContainerProps): Grid => {
        const grid = setupGrid(props);
        grids.push(grid);
        return grid;
    };

    beforeEach(() => jest.useFakeTimers());
    afterEach(() => {
        grids.splice(0).forEach(g => g.dispose());
        jest.useRealTimers();
        localStorage.clear();
    });

    function personalize({ columns }: Grid): void {
        columns.swapColumns(id(2), [id(0), "before"]);
        columns._allColumns[1].toggleHidden();
        columns._allColumns[0].setSize(150);
        columns._allColumns[2].setSize(90);
        columns._allColumns[0].toggleSort();
        columns._allColumns[0].toggleSort();
        columns.setColumnFilterSettings([[id(2), ["contains", "foo", null]]]);
    }

    it("writes the settings to the attribute after a short delay", () => {
        const attr = editable<string>();
        const grid = open(gridProps({ configurationAttribute: attr }));
        jest.advanceTimersByTime(WRITE_DELAY_MS);
        (attr.setValue as jest.Mock).mockClear();

        grid.columns._allColumns[1].toggleHidden();
        expect(attr.setValue).not.toHaveBeenCalled();

        jest.advanceTimersByTime(WRITE_DELAY_MS);
        expect(attr.setValue).toHaveBeenCalledTimes(1);
        expect(JSON.parse(storedJson(attr))).toMatchObject({
            name: "datagrid2_1",
            schemaVersion: 3,
            columns: [
                { columnId: "0", hidden: false },
                { columnId: "1", hidden: true },
                { columnId: "2", hidden: false }
            ]
        });
    });

    it("restores order, hidden columns, sizes, sort and column filters from the attribute", () => {
        const attr = editable<string>();
        const first = open(gridProps({ configurationAttribute: attr }));
        personalize(first);
        jest.advanceTimersByTime(WRITE_DELAY_MS);

        const second = open(gridProps({ configurationAttribute: editable.with(storedJson(attr)) }));

        expect(gridState(second)).toEqual({
            visible: ["C", "A"],
            available: ["C", "A", "B"],
            sizes: [90, 150, undefined],
            sort: [["attrA", "desc"]],
            filters: [["2", ["contains", "foo", null]]]
        });
        expect(gridState(second)).toEqual(gridState(first));
    });

    it("restores the same state from localStorage", () => {
        const props = (): DatagridContainerProps =>
            gridProps({ configurationStorageType: "localStorage", configurationAttribute: undefined });
        const first = open(props());
        personalize(first);
        jest.advanceTimersByTime(WRITE_DELAY_MS);

        const second = open(props());

        expect(gridState(second)).toEqual(gridState(first));
    });

    it("restores a multi-column sort in its order", () => {
        const firstProps = gridProps();
        firstProps.datasource = sortedList([
            ["attrC" as ListAttributeValue["id"], "desc"],
            ["attrA" as ListAttributeValue["id"], "asc"]
        ]);
        const first = open(firstProps);
        first.columns._allColumns[1].toggleHidden();
        jest.advanceTimersByTime(WRITE_DELAY_MS);

        const second = open(
            gridProps({ configurationAttribute: editable.with(storedJson(firstProps.configurationAttribute)) })
        );

        expect(second.columns.sortInstructions).toEqual([
            ["attrC", "desc"],
            ["attrA", "asc"]
        ]);
    });

    it("restores custom filter settings", () => {
        const attr = editable<string>();
        const first = open(gridProps({ configurationAttribute: attr }));
        first.filterHost.observe("search", {
            toJSON: () => ["contains", "bar", null],
            fromJSON: jest.fn(),
            fromViewState: jest.fn(),
            condition: undefined
        } as never);
        first.columns._allColumns[1].toggleHidden();
        jest.advanceTimersByTime(WRITE_DELAY_MS);

        const second = open(gridProps({ configurationAttribute: editable.with(storedJson(attr)) }));
        const fromJSON = jest.fn();
        second.filterHost.observe("search", {
            toJSON: () => undefined,
            fromJSON,
            fromViewState: jest.fn(),
            condition: undefined
        } as never);

        expect(fromJSON).toHaveBeenCalledWith(["contains", "bar", null]);
    });

    it("does not store filters when storeFiltersInPersonalization is off", () => {
        const attr = editable<string>();
        const first = open(gridProps({ configurationAttribute: attr, storeFiltersInPersonalization: false }));
        personalize(first);
        jest.advanceTimersByTime(WRITE_DELAY_MS);

        expect(JSON.parse(storedJson(attr))).toMatchObject({ columnFilters: [], customFilters: [] });

        const second = open(
            gridProps({ configurationAttribute: editable.with(storedJson(attr)), storeFiltersInPersonalization: false })
        );
        expect(gridState(second).filters).toEqual([]);
        expect(gridState(second).visible).toEqual(["C", "A"]);
    });

    it("ignores settings written by a grid with another name", () => {
        const attr = editable<string>();
        personalize(open(gridProps({ configurationAttribute: attr, name: "other" })));
        jest.advanceTimersByTime(WRITE_DELAY_MS);
        jest.spyOn(console, "warn").mockImplementation(() => undefined);

        const second = open(gridProps({ configurationAttribute: editable.with(storedJson(attr)) }));

        expect(gridState(second).visible).toEqual(["A", "B", "C"]);
    });

    it("ignores settings written for a different column configuration", () => {
        const attr = editable<string>();
        personalize(open(gridProps({ configurationAttribute: attr })));
        jest.advanceTimersByTime(WRITE_DELAY_MS);

        const second = open(
            gridProps({
                configurationAttribute: editable.with(storedJson(attr)),
                columns: [gridColumn("A"), gridColumn("B", c => (c.hidable = "no")), gridColumn("C")]
            })
        );

        expect(gridState(second).visible).toEqual(["A", "B", "C"]);
    });

    it("erases settings that have an unknown schema", () => {
        jest.spyOn(console, "warn").mockImplementation(() => undefined);
        const attr = editable.with(JSON.stringify({ name: "datagrid2_1", settingsHash: "1", schemaVersion: 2 }));

        open(gridProps({ configurationAttribute: attr }));

        expect(attr.setValue).toHaveBeenCalledWith(undefined);
    });

    it("current behaviour: settings are not restored when the last column's visibility was loading as the previous grid was created", () => {
        const attr = editable<string>();
        const first = open(
            gridProps({
                configurationAttribute: attr,
                columns: [gridColumn("A"), gridColumn("B"), gridColumn("C", c => (c.visible = dynamic.loading()))]
            })
        );
        first.columns._allColumns[0].toggleHidden();
        jest.advanceTimersByTime(WRITE_DELAY_MS);

        const second = open(gridProps({ configurationAttribute: editable.with(storedJson(attr)) }));

        expect(gridState(second).visible).toEqual(["A", "B", "C"]);
    });
});
