import { cases, list, listExpression, listReference, ListValueBuilder, obj } from "@mendix/widget-plugin-test-utils";
import { ObjectItem } from "mendix";
import { _resetGlobalState, autorun } from "mobx";
import { RefFilterStore, RefFilterStoreProps } from "../stores/picker/RefFilterStore";

describe("RefFilterStore", () => {
    afterEach(() => _resetGlobalState());

    describe("get options()", () => {
        let items: ObjectItem[];
        let mapItem: (item: ObjectItem) => string;
        let store: RefFilterStore;
        beforeEach(() => {
            const [a, b, c] = [obj("id3n"), obj("f8x3"), obj("932c")];
            items = [a, b, c];
            mapItem = cases([a, "Alice"], [b, "Bob"], [c, "Chuck"], [undefined, "No caption"]);
            store = new RefFilterStore(
                {
                    ref: listReference(),
                    datasource: list(items),
                    caption: listExpression(mapItem)
                },
                null
            );
        });

        it("returns array of options", () => {
            expect(store.options).toMatchInlineSnapshot(`
                [
                  {
                    "caption": "Alice",
                    "selected": false,
                    "value": "obj_id3n",
                  },
                  {
                    "caption": "Bob",
                    "selected": false,
                    "value": "obj_f8x3",
                  },
                  {
                    "caption": "Chuck",
                    "selected": false,
                    "value": "obj_932c",
                  },
                ]
            `);
        });
    });

    describe("get condition()", () => {
        it.todo("return filter condition using equals");
    });

    describe("toJSON()", () => {
        let store: RefFilterStore;
        beforeEach(() => {
            store = new RefFilterStore(
                {
                    ref: listReference(),
                    datasource: list(3),
                    caption: listExpression(() => "[string]")
                },
                null
            );
        });

        it("returns state as JS array", () => {
            expect(store.toJSON()).toEqual([]);
        });

        it("save state with one item", () => {
            const guid = store.options[0].value;
            store.toggle(guid);
            expect(store.toJSON()).toEqual([guid]);
        });

        it("save state with multiple items", () => {
            const [guid1, guid2] = [store.options[0].value, store.options[1].value];
            store.toggle(guid1);
            store.toggle(guid2);
            const output = store.toJSON();

            expect(output).toHaveLength(2);
            expect(output).toContain(guid1);
            expect(output).toContain(guid2);
        });
    });

    describe("fromJSON()", () => {
        let store: RefFilterStore;
        beforeEach(() => {
            store = new RefFilterStore(
                {
                    ref: listReference(),
                    datasource: list([obj("id3n"), obj("f8x3"), obj("932c")]),
                    caption: listExpression(() => "[string]")
                },
                null
            );
        });

        it("restore state from JS array", () => {
            const output: Array<typeof store.options> = [];
            autorun(() => output.push(store.options));

            // Check that every option is unselected
            expect(output[0].map(option => option.selected)).toEqual([false, false, false]);
            // Restore state
            store.fromJSON(["obj_id3n"]);
            // Check that first option is selected
            expect(output[1].map(option => option.selected)).toEqual([true, false, false]);
        });

        it("overrides any previous state", () => {
            const output: Array<typeof store.options> = [];

            // Select each option
            store.options.forEach(option => {
                store.toggle(option.value);
            });
            // Start observing
            autorun(() => output.push(store.options));
            // Check the state
            expect(output[0].map(option => option.selected)).toEqual([true, true, true]);
            store.fromJSON(["obj_932c"]);
            expect(output[1].map(option => option.selected)).toEqual([false, false, true]);
        });

        it("should not change state if json is null", () => {
            const state = store.toJSON();
            store.fromJSON(null);
            expect(store.toJSON()).toEqual(state);
        });
    });

    describe("toggle()", () => {
        let store: RefFilterStore;
        beforeEach(() => {
            store = new RefFilterStore(
                {
                    ref: listReference(),
                    datasource: list([obj("id3n"), obj("f8x3"), obj("932c")]),
                    caption: listExpression(() => "[string]")
                },
                null
            );
        });

        it("compute new options", () => {
            const output: Array<typeof store.options> = [];
            const [x, y] = store.options;

            autorun(() => output.push(store.options));
            expect(output[0].map(opt => opt.selected)).toEqual([false, false, false]);

            store.toggle(x.value);
            store.toggle(y.value);
            expect(output[2].map(opt => opt.selected)).toEqual([true, true, false]);

            store.toggle(x.value);
            expect(output[3].map(opt => opt.selected)).toEqual([false, true, false]);
        });
    });

    describe("with 'fetchOptionsLazy' flag", () => {
        it("should set limit to 0 on options datasource", () => {
            const datasource = list.loading();
            const props = {
                ref: listReference(),
                datasource,
                caption: listExpression(() => "[string]"),
                fetchOptionsLazy: true
            };

            new RefFilterStore(props, null);

            expect(datasource.setLimit).toHaveBeenLastCalledWith(0);
        });

        it("should not change limit if flag is false", () => {
            const datasource = list.loading();
            const props = {
                ref: listReference(),
                datasource,
                caption: listExpression(() => "[string]"),
                fetchOptionsLazy: false
            };

            new RefFilterStore(props, null);

            expect(datasource.setLimit).not.toHaveBeenCalled();
        });
    });

    describe("when datasource changed", () => {
        it("compute new options", () => {
            const a = obj("id3n");
            const props = {
                ref: listReference(),
                datasource: list.loading(),
                caption: listExpression(cases([a, "Alice"], [undefined, "No caption"]))
            };
            const store = new RefFilterStore(props, null);
            const output: any[] = [];
            autorun(() => output.push(store.options));

            expect(output[0]).toEqual([]);
            store.updateProps({ ...props, datasource: list([a]) });
            expect(output[1]).toEqual([
                {
                    caption: "Alice",
                    selected: false,
                    value: "obj_id3n"
                }
            ]);
        });
    });

    describe("json data filtering", () => {
        const savedJson = ["obj_xx", "obj_xiii", "obj_deleted", "obj_yy", "obj_unknown"];
        let a: ObjectItem;
        let b: ObjectItem;
        let props: Omit<RefFilterStoreProps, "datasource">;
        beforeEach(() => {
            a = obj("xx");
            b = obj("yy");
            props = {
                ref: listReference(),
                caption: listExpression(() => "[string]")
            };
        });

        it("skip filtering if has just part of the list", () => {
            const store = new RefFilterStore({ ...props, datasource: list.loading() }, null);
            // Restore state
            store.fromJSON(savedJson);
            // Check state
            expect(store.toJSON()).toEqual(savedJson);
            // Update with partial data
            const datasource = new ListValueBuilder().withItems([a, b]).withHasMore(true).build();
            store.updateProps({ ...props, datasource });
            // Check that state still has unknown GUIDs
            expect(store.toJSON()).toEqual(savedJson);
        });

        it("allows to restore any state if datasource is loading", () => {
            const store = new RefFilterStore({ ...props, datasource: list.loading() }, null);
            // Restore state
            store.fromJSON(savedJson);
            // Check state
            expect(store.toJSON()).toEqual(savedJson);
        });
    });
});
