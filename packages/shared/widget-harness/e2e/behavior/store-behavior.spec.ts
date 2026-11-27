// Each test states one behavior of the pluggable widget API props. The `harness` project checks the
// harness; the `runtime` project checks the same expectations against a real Mendix app with the
// datagrid-web test project (see runtime/README.md). Data: Persons test/test2/test3, ages 10/11/12.
import { act, count, expect, expectValues, itemId, last, quiet, since, test, values } from "./target";

const Person = "MyFirstModule.Person";

test.describe.configure({ mode: "serial" });

test.describe("ListValue", () => {
    const grid = "datagrid1"; // sorted by Last Name desc, page size 5

    test.beforeEach(async ({ target }) => {
        await target.open("home");
    });

    test("initial load goes from loading without items to available", async ({ shared }) => {
        const [first] = await since(shared, grid, 0);
        expect(first.datasource).toMatchObject({ status: "loading", offset: 0, limit: Infinity });
        expect(first.datasource.ids).toBeUndefined();
        expect((await last(shared, grid)).datasource).toMatchObject({ status: "available", limit: 5, totalCount: 3 });
        expect(await values(shared, grid, "First Name")).toEqual(["test3", "test2", "test"]);
    });

    test("setFilter applies a contains condition, ignoring case", async ({ shared }) => {
        await act(shared, grid, ({ props, b, col }) =>
            props.datasource.setFilter(b.contains(b.attribute(col("First Name").id), b.literal("TEST2")))
        );
        await expectValues(shared, grid, "First Name").toEqual(["test2"]);
        expect((await last(shared, grid)).datasource).toMatchObject({ totalCount: 1, hasFilter: true });
    });

    test("equals on a string ignores case", async ({ shared }) => {
        await act(shared, grid, ({ props, b, col }) =>
            props.datasource.setFilter(b.equals(b.attribute(col("First Name").id), b.literal("TEST3")))
        );
        await expectValues(shared, grid, "First Name").toEqual(["test3"]);
    });

    test("setFilter(undefined) clears the filter", async ({ shared }) => {
        await act(shared, grid, ({ props, b, col }) =>
            props.datasource.setFilter(b.contains(b.attribute(col("First Name").id), b.literal("2")))
        );
        await expectValues(shared, grid, "First Name").toEqual(["test2"]);
        await act(shared, grid, ({ props }) => props.datasource.setFilter(undefined));
        await expectValues(shared, grid, "First Name").toEqual(["test3", "test2", "test"]);
        expect((await last(shared, grid)).datasource.hasFilter).toBe(false);
    });

    test("setting an equal filter again does not reload", async ({ shared }) => {
        const contains2 = ({ props, b, col }: any): void =>
            props.datasource.setFilter(b.contains(b.attribute(col("First Name").id), b.literal("2")));
        await act(shared, grid, contains2);
        await expectValues(shared, grid, "First Name").toEqual(["test2"]);
        const n = await count(shared, grid);
        await act(shared, grid, contains2);
        await quiet();
        expect(await count(shared, grid)).toBe(n);
    });

    test("setSortOrder sorts ascending and descending", async ({ shared }) => {
        await act(shared, grid, ({ props, col }) => props.datasource.setSortOrder([[col("Age").id, "asc"]]));
        await expectValues(shared, grid, "Age").toEqual(["10", "11", "12"]);
        await act(shared, grid, ({ props, col }) => props.datasource.setSortOrder([[col("Age").id, "desc"]]));
        await expectValues(shared, grid, "Age").toEqual(["12", "11", "10"]);
    });

    test("setting an equal sort order again does not reload", async ({ shared }) => {
        await act(shared, grid, ({ props, col }) => props.datasource.setSortOrder([[col("Age").id, "asc"]]));
        await expectValues(shared, grid, "Age").toEqual(["10", "11", "12"]);
        const n = await count(shared, grid);
        await act(shared, grid, ({ props, col }) => props.datasource.setSortOrder([[col("Age").id, "asc"]]));
        await quiet();
        expect(await count(shared, grid)).toBe(n);
    });

    test("setSortOrder(undefined) restores the data source's own sort order", async ({ shared }) => {
        await act(shared, grid, ({ props, col }) => props.datasource.setSortOrder([[col("Age").id, "asc"]]));
        await expectValues(shared, grid, "Age").toEqual(["10", "11", "12"]);
        await act(shared, grid, ({ props }) => props.datasource.setSortOrder(undefined));
        await expectValues(shared, grid, "Last Name").toEqual(["test3", "test2", "test"]);
    });

    test("setLimit and setOffset page through the rows and set hasMoreItems", async ({ shared }) => {
        await act(shared, grid, ({ props }) => props.datasource.setLimit(2));
        await expectValues(shared, grid, "First Name").toEqual(["test3", "test2"]);
        expect((await last(shared, grid)).datasource).toMatchObject({ offset: 0, limit: 2, hasMoreItems: true });

        await act(shared, grid, ({ props }) => props.datasource.setOffset(1));
        await expectValues(shared, grid, "First Name").toEqual(["test2", "test"]);
        expect((await last(shared, grid)).datasource).toMatchObject({ offset: 1, limit: 2, hasMoreItems: false });
    });

    test("setLimit(0) returns an empty list without a total count", async ({ shared }) => {
        await act(shared, grid, ({ props }) => props.datasource.setLimit(0));
        await expect.poll(async () => (await last(shared, grid)).datasource.limit).toBe(0);
        expect((await last(shared, grid)).datasource).toMatchObject({ ids: [], hasMoreItems: true });
        expect((await last(shared, grid)).datasource.totalCount).toBeUndefined();
    });

    test("requestTotalCount toggles totalCount", async ({ shared }) => {
        await act(shared, grid, ({ props }) => props.datasource.requestTotalCount(false));
        await expect.poll(async () => (await last(shared, grid)).datasource.totalCount).toBeUndefined();
        await act(shared, grid, ({ props }) => props.datasource.requestTotalCount(true));
        await expect.poll(async () => (await last(shared, grid)).datasource.totalCount).toBe(3);
    });

    test("reload publishes a new value with the same parameters", async ({ shared }) => {
        const before = (await last(shared, grid)).datasource;
        const n = await count(shared, grid);
        await act(shared, grid, ({ props }) => props.datasource.reload());
        await expect.poll(() => count(shared, grid)).toBeGreaterThan(n);
        const after = (await last(shared, grid)).datasource;
        expect(after).toEqual({ ...before });
    });

    test("a fast request skips the loading value", async ({ shared }) => {
        const n = await count(shared, grid);
        await act(shared, grid, ({ props, col }) => props.datasource.setSortOrder([[col("Age").id, "asc"]]));
        await expectValues(shared, grid, "Age").toEqual(["10", "11", "12"]);
        const statuses = (await since(shared, grid, n)).map(s => s.datasource.status);
        expect(statuses).toEqual(["available"]);
    });

    test("a slow request is loading with the previous items and parameters", async ({ shared, target }) => {
        const before = (await last(shared, grid)).datasource;
        const n = await count(shared, grid);
        await target.slowNetwork(800);
        await act(shared, grid, ({ props, col }) => props.datasource.setSortOrder([[col("Age").id, "asc"]]));
        await expectValues(shared, grid, "Age").toEqual(["10", "11", "12"]);
        await target.slowNetwork(0);
        const [loading, ...rest] = await since(shared, grid, n);
        expect(loading.datasource).toEqual({ ...before, status: "loading" });
        expect(rest.map(s => s.datasource.status)).toEqual(["available"]);
    });

    test("a limit change over rows already fetched does not load", async ({ shared, target }) => {
        await target.slowNetwork(800);
        const n = await count(shared, grid);
        await act(shared, grid, ({ props }) => props.datasource.setLimit(2));
        await expectValues(shared, grid, "First Name").toEqual(["test3", "test2"]);
        await act(shared, grid, ({ props }) => props.datasource.setLimit(5));
        await expectValues(shared, grid, "First Name").toEqual(["test3", "test2", "test"]);
        await target.slowNetwork(0);
        expect((await since(shared, grid, n)).map(s => s.datasource.status)).toEqual(["available", "available"]);
    });

    test("a committed change to a listed object updates the list and the widget", async ({ shared, target }) => {
        const id = await itemId(shared, grid, 0);
        try {
            await shared.evaluate(([i]) => (window as any).__t.update(i, "FirstName", "zed"), [id]);
            await expectValues(shared, grid, "First Name").toEqual(["zed", "test2", "test"]);
            await expect(shared.locator(".mx-name-datagrid1 [role=gridcell]").getByText("zed")).toBeVisible();
        } finally {
            await shared.evaluate(([i]) => (window as any).__t.update(i, "FirstName", "test3"), [id]);
            await target.open("home");
        }
    });

    test("a created object appears in the list", async ({ shared }) => {
        let id: string | undefined;
        try {
            id = await shared.evaluate(
                e => (window as any).__t.create(e, { FirstName: "new", LastName: "aaa" }),
                Person
            );
            await expectValues(shared, grid, "First Name").toEqual(["test3", "test2", "test", "new"]);
            expect((await last(shared, grid)).datasource.totalCount).toBe(4);
        } finally {
            if (id) {
                await shared.evaluate(i => (window as any).__t.remove(i), id);
            }
        }
    });

    test("a deleted object is gone after reload", async ({ shared }) => {
        const id = await shared.evaluate(
            e => (window as any).__t.create(e, { FirstName: "gone", LastName: "aaa" }),
            Person
        );
        await expectValues(shared, grid, "First Name").toContain("gone");
        await shared.evaluate(i => (window as any).__t.remove(i), id);
        await act(shared, grid, ({ props }) => props.datasource.reload());
        await expectValues(shared, grid, "First Name").toEqual(["test3", "test2", "test"]);
    });
});

test.describe("ListAttributeValue", () => {
    const grid = "datagrid3";

    test.beforeEach(async ({ target }) => {
        await target.open("home");
    });

    test("get(item) gives each item's value and formatted displayValue", async ({ shared }) => {
        expect(await values(shared, grid, "Age")).toEqual(["10", "11", "12"]);
        expect(await values(shared, grid, "First Name")).toEqual(["test", "test2", "test3"]);
        expect(await values(shared, grid, "Birthday")).toEqual(["11/5/2020", "11/25/2020", "10/5/2020"]);
        const first = await act(shared, grid, ({ props, col }) =>
            col("Age").get(props.datasource.items[0]).value.toString()
        );
        expect(first).toBe("10");
    });

    test("describes the attribute type and its formatter", async ({ shared }) => {
        const meta = await act(shared, grid, ({ col }) =>
            ["Age", "First Name", "Birthday"].map(h => {
                const a = col(h);
                return { type: a.type, formatter: a.formatter.type, config: a.formatter.config, sortable: a.sortable };
            })
        );
        expect(meta).toEqual([
            { type: "Integer", formatter: "number", config: { groupDigits: false }, sortable: true },
            { type: "String", sortable: true },
            { type: "DateTime", formatter: "datetime", config: { type: "date" }, sortable: true }
        ]);
    });

    test("values of a list attribute are read-only", async ({ shared }) => {
        const readOnly = await act(shared, grid, ({ props, col }) =>
            ["Age", "First Name", "Birthday"].map(h => col(h).get(props.datasource.items[0]).readOnly)
        );
        expect(readOnly).toEqual([true, true, true]);
    });
});

test.describe("EditableValue", () => {
    const grid = "datagrid5"; // configurationAttribute

    test.beforeEach(async ({ target }) => {
        await target.open("home");
    });

    test.afterEach(async ({ shared }) => {
        await act(shared, grid, ({ props }) => {
            props.configurationAttribute.setValidator(undefined);
            props.configurationAttribute.setValue("");
        });
    });

    test("setValue publishes the new value and displayValue", async ({ shared }) => {
        expect((await last(shared, grid)).configurationAttribute).toMatchObject({
            status: "available",
            value: "",
            readOnly: false
        });
        await act(shared, grid, ({ props }) => props.configurationAttribute.setValue("hello"));
        await expect
            .poll(async () => (await last(shared, grid)).configurationAttribute)
            .toMatchObject({ value: "hello", displayValue: "hello" });
    });

    test("a validator's message shows on an invalid value and clears on a valid one", async ({ shared }) => {
        await act(shared, grid, ({ props }) => {
            props.configurationAttribute.setValidator((v: string) => (v === "bad" ? "Bad value" : undefined));
            props.configurationAttribute.setValue("bad");
        });
        await expect
            .poll(async () => (await last(shared, grid)).configurationAttribute)
            .toMatchObject({ value: "bad", validation: "Bad value" });
        await act(shared, grid, ({ props }) => props.configurationAttribute.setValue("good"));
        await expect.poll(async () => (await last(shared, grid)).configurationAttribute.value).toBe("good");
        expect((await last(shared, grid)).configurationAttribute.validation).toBeUndefined();
    });

    test("setTextValue parses text with the formatter", async ({ shared }) => {
        await act(shared, grid, ({ props }) => props.configurationAttribute.setTextValue("text"));
        await expect.poll(async () => (await last(shared, grid)).configurationAttribute.value).toBe("text");
        const formatter = await act(shared, grid, ({ props }) => ({
            type: props.configurationAttribute.formatter.type,
            parsed: props.configurationAttribute.formatter.parse("y")
        }));
        expect(formatter).toEqual({ parsed: { valid: true, value: "y" } });
    });
});

test.describe("ListActionValue", () => {
    const grid = "datagrid1"; // onClick

    test.beforeEach(async ({ target }) => {
        await target.open("home");
    });

    test("an action can execute and is not executing initially", async ({ shared }) => {
        const state = await act(shared, grid, ({ props }) => {
            const a = props.onClick.get(props.datasource.items[0]);
            return { canExecute: a.canExecute, isExecuting: a.isExecuting };
        });
        expect(state).toEqual({ canExecute: true, isExecuting: false });
    });

    test("execute makes the next props report isExecuting, then clears it", async ({ shared }) => {
        const trace = await shared.evaluate(async () => {
            const t = (window as any).__t;
            const p = t.probe("datagrid1");
            const item = p.props.datasource.items[0];
            const latest = (): boolean => p.props.onClick.get(item).isExecuting;
            const a = p.props.onClick.get(item);
            a.execute();
            const seen = [latest(), a.isExecuting];
            const deadline = Date.now() + 3000;
            while (latest() && Date.now() < deadline) {
                await new Promise(resolve => setTimeout(resolve, 20));
            }
            seen.push(latest());
            return seen;
        });
        // [fresh get right after execute, the executed ActionValue object, fresh get later]
        expect(trace).toEqual([true, false, false]);
    });
});

test.describe("SelectionMultiValue", () => {
    const grid = "dgMultiSelectionCheckbox";
    const selected = async (page: any): Promise<string[]> => (await last(page, grid)).selection.ids;
    const ids = async (page: any): Promise<string[]> => (await last(page, grid)).datasource.ids;

    test.beforeEach(async ({ target }) => {
        await target.open("multi-selection");
    });

    test("setSelection selects and deselects objects", async ({ shared }) => {
        const all = await ids(shared);
        await act(shared, grid, ({ props }) => props.itemSelection.setSelection([props.datasource.items[0]]));
        await expect.poll(() => selected(shared)).toEqual([all[0]]);
        await act(shared, grid, ({ props }) => props.itemSelection.setSelection(props.datasource.items));
        await expect.poll(() => selected(shared)).toEqual(all);
        await act(shared, grid, ({ props }) => props.itemSelection.setSelection([]));
        await expect.poll(() => selected(shared)).toEqual([]);
    });

    test("an equal selection is ignored", async ({ shared }) => {
        await act(shared, grid, ({ props }) => props.itemSelection.setSelection(props.datasource.items));
        await expect.poll(async () => (await selected(shared)).length).toBe(3);
        const n = await count(shared, grid);
        await act(shared, grid, ({ props }) => props.itemSelection.setSelection([...props.itemSelection.selection]));
        await quiet();
        expect(await count(shared, grid)).toBe(n);
    });

    test("selecting an object that is not in the list throws", async ({ shared }) => {
        const error = await act(shared, grid, ({ props }) => {
            try {
                props.itemSelection.setSelection([{ id: "123" }]);
                return "no error";
            } catch (e) {
                return String(e);
            }
        });
        expect(error).toContain("is not assignable to selection of type Multi");
    });

    test("the selection survives a reload", async ({ shared }) => {
        await act(shared, grid, ({ props }) => props.itemSelection.setSelection(props.datasource.items));
        await expect.poll(async () => (await selected(shared)).length).toBe(3);
        const n = await count(shared, grid);
        await act(shared, grid, ({ props }) => props.datasource.reload());
        await expect.poll(() => count(shared, grid)).toBeGreaterThan(n);
        expect((await selected(shared)).length).toBe(3);
    });

    test("a load drops selected objects the list no longer holds", async ({ shared }) => {
        const all = await ids(shared);
        await act(shared, grid, ({ props }) => props.itemSelection.setSelection(props.datasource.items));
        await act(shared, grid, ({ props, b, col }) =>
            props.datasource.setFilter(b.equals(b.attribute(col("First Name").id), b.literal("test")))
        );
        await expect.poll(() => selected(shared)).toEqual([all[0]]);
        await act(shared, grid, ({ props }) => props.datasource.setFilter(undefined));
        await expect.poll(() => ids(shared)).toEqual(all);
        expect(await selected(shared)).toEqual([all[0]]);
    });

    test("a selected object paged out of the list is dropped", async ({ shared }) => {
        await act(shared, grid, ({ props }) => {
            props.itemSelection.setSelection([props.datasource.items[0]]);
            props.datasource.setLimit(1);
        });
        await expect.poll(async () => (await selected(shared)).length).toBe(1);
        await act(shared, grid, ({ props }) => props.datasource.setOffset(1));
        await expect.poll(() => selected(shared)).toEqual([]);
    });

    test("setKeepSelection keeps objects the predicate accepts", async ({ shared }) => {
        await act(shared, grid, ({ props, b, col }) => {
            props.itemSelection.setSelection(props.datasource.items);
            props.itemSelection.setKeepSelection(() => true);
            props.datasource.setFilter(b.equals(b.attribute(col("First Name").id), b.literal("test")));
        });
        await expect.poll(async () => (await ids(shared)).length).toBe(1);
        expect((await selected(shared)).length).toBe(3);
    });
});

test.describe("SelectionSingleValue", () => {
    const grid = "dgSingleSelectionCheckbox";

    test.beforeEach(async ({ target }) => {
        await target.open("single-selection");
    });

    test("setSelection selects one object, undefined deselects, and a reload keeps it", async ({ shared }) => {
        const all = (await last(shared, grid)).datasource.ids;
        await act(shared, grid, ({ props }) => props.itemSelection.setSelection(props.datasource.items[1]));
        await expect.poll(async () => (await last(shared, grid)).selection.ids).toBe(all[1]);
        await act(shared, grid, ({ props }) => props.datasource.reload());
        await quiet();
        expect((await last(shared, grid)).selection.ids).toBe(all[1]);
        await act(shared, grid, ({ props }) => props.itemSelection.setSelection(undefined));
        await expect.poll(async () => (await last(shared, grid)).selection.ids).toBeUndefined();
    });
});
