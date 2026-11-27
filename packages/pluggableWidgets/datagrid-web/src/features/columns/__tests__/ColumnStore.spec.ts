import { ListAttributeValue } from "mendix";
import { listAttribute, listExpression, obj } from "@mendix/widget-plugin-test-utils";
import { ColumnsType } from "../../../../typings/DatagridProps";
import { column } from "../../../__tests__/test-utils";
import { ColumnsSortingStore } from "../ColumnsSortingStore";
import { ColumnStore, IColumnParentStore } from "../ColumnStore";
import { ColumnId } from "../GridColumn";

function parent(overrides: Partial<IColumnParentStore> = {}): IColumnParentStore {
    return {
        isLastVisible: () => false,
        isResizing: false,
        sorting: new ColumnsSortingStore([]),
        ...overrides
    };
}

const createColumn = (props: ColumnsType, parentStore = parent(), index = 0): ColumnStore =>
    new ColumnStore(index, props, parentStore);

describe("ColumnStore", () => {
    it("uses its index as column id", () => {
        expect(createColumn(column(), parent(), 3).columnId).toBe("3");
    });

    it("reads the header and attribute id from props", () => {
        const col = createColumn(
            column("Name", c => (c.attribute = listAttribute(() => "x", "attrName" as ListAttributeValue["id"])))
        );

        expect(col.header).toBe("Name");
        expect(col.attrId).toBe("attrName");
    });

    it("can't hide a column that is not hidable", () => {
        const col = createColumn(column("A", c => (c.hidable = "no")));

        expect(col.canHide).toBe(false);
        expect(col.isHidden).toBe(false);
    });

    it("starts hidden when hidable is 'hidden'", () => {
        const col = createColumn(column("A", c => (c.hidable = "hidden")));

        expect(col.canHide).toBe(true);
        expect(col.initiallyHidden).toBe(true);
        expect(col.isHidden).toBe(true);
    });

    it("reads sort direction and weight from the sorting store", () => {
        const sorting = new ColumnsSortingStore([
            ["1" as ColumnId, "asc"],
            ["0" as ColumnId, "desc"]
        ]);
        const col = createColumn(column(), parent({ sorting }), 0);

        expect(col.sortDir).toBe("desc");
        expect(col.sortWeight).toBe(2);
    });

    it("toggles its own sort in the sorting store", () => {
        const sorting = new ColumnsSortingStore([]);
        const col = createColumn(column(), parent({ sorting }), 1);

        col.toggleSort();

        expect(sorting.rules).toEqual([["1", "asc"]]);
    });

    it("can resize when resizable and not the last visible column", () => {
        const props = column("A", c => (c.resizable = true));

        expect(createColumn(props, parent({ isLastVisible: () => false })).canResize).toBe(true);
        expect(createColumn(props, parent({ isLastVisible: () => true })).canResize).toBe(false);
    });

    it("uses the configured width until it gets a size", () => {
        const col = createColumn(column("A", c => (c.width = "autoFit")));

        expect(col.getCssWidth()).toBe("minmax(auto, auto)");

        col.setSize(120);
        expect(col.getCssWidth()).toBe("120px");
    });

    it("fills the remaining space when it is the last visible column with a size", () => {
        const col = createColumn(column(), parent({ isLastVisible: () => true }));

        col.setSize(120);

        expect(col.getCssWidth()).toBe("minmax(auto, auto)");
    });

    it("exposes its state as personalization settings", () => {
        const sorting = new ColumnsSortingStore([["2" as ColumnId, "desc"]]);
        const col = createColumn(
            column("A", c => (c.hidable = "hidden")),
            parent({ sorting }),
            2
        );
        col.setSize(80);

        expect(col.settings).toEqual({
            columnId: "2",
            size: 80,
            hidden: true,
            orderWeight: 20,
            sortDir: "desc",
            sortWeight: 1
        });
    });

    it("reports the size from before resizing started while the grid is resizing", () => {
        const parentStore = parent();
        const col = createColumn(column(), parentStore);
        col.setSize(80);
        col.setHeaderElementRef({ offsetWidth: 150 } as HTMLDivElement);

        parentStore.isResizing = true;
        col.takeSizeSnapshot();

        expect(col.size).toBe(150);
        expect(col.settings.size).toBe(80);
    });

    it("applies size, hidden state and order from settings", () => {
        const col = createColumn(column("A", c => (c.hidable = "yes")));

        col.applySettings({
            columnId: "0" as ColumnId,
            size: 90,
            hidden: true,
            orderWeight: 4,
            sortDir: undefined,
            sortWeight: undefined
        });

        expect(col.size).toBe(90);
        expect(col.isHidden).toBe(true);
        expect(col.orderWeight).toBe(40);
    });

    it("ignores the hidden setting for a column that can't be hidden", () => {
        const col = createColumn(column("A", c => (c.hidable = "no")));

        col.applySettings({
            columnId: "0" as ColumnId,
            size: undefined,
            hidden: true,
            orderWeight: 0,
            sortDir: undefined,
            sortWeight: undefined
        });

        expect(col.isHidden).toBe(false);
    });

    it("returns the column class for an item", () => {
        const col = createColumn(column("A", c => (c.columnClass = listExpression(() => "my-class"))));

        expect(col.columnClass(obj())).toBe("my-class");
    });
});
