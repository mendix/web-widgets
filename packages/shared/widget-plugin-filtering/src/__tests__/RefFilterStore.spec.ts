import { ObjectItem } from "mendix";
import { list, listReference, listExpression, obj, cases } from "@mendix/widget-plugin-test-utils";
import { RefFilterStore } from "../stores/RefFilterStore";
import { autorun, _resetGlobalState } from "mobx";

describe("RefFilterStore", () => {
    afterEach(() => _resetGlobalState());

    describe("get options()", () => {
        let items: ObjectItem[];
        let mapItem: (item: ObjectItem) => string;
        beforeEach(() => {
            const [a, b, c] = [obj("id3n"), obj("f8x3"), obj("932c")];
            items = [a, b, c];
            mapItem = cases([a, "Alice"], [b, "Bob"], [c, "Chuck"], [undefined, "No caption"]);
        });

        it("returns array of options", () => {
            const props = {
                ref: listReference(),
                refOptions: list(items),
                caption: listExpression(mapItem)
            };

            const store = new RefFilterStore(props, null);

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

        it("compute new options whenever datasource is changed", () => {
            const [a] = items;
            const props = {
                ref: listReference(),
                refOptions: list.loading(),
                caption: listExpression(mapItem)
            };
            const store = new RefFilterStore(props, null);
            const output: any[] = [];
            autorun(() => output.push(store.options));

            expect(output[0]).toEqual([]);
            store.updateProps({ ...props, refOptions: list([a]) });
            expect(output[1]).toEqual([
                {
                    caption: "Alice",
                    selected: false,
                    value: "obj_id3n"
                }
            ]);
        });

        it("compute new options when state is restored", () => {
            const props = {
                ref: listReference(),
                refOptions: list(items),
                caption: listExpression(mapItem)
            };
            const store = new RefFilterStore(props, null);
            const output: Array<typeof store.options> = [];
            autorun(() => output.push(store.options));

            // Check that every option is unselected
            expect(output[0].map(option => option.selected)).toEqual([false, false, false]);
            // Restore state
            store.fromJSON(["obj_id3n"]);
            // Check that first option is selected
            expect(output[1].map(option => option.selected)).toEqual([true, false, false]);
        });
    });

    describe("get condition()", () => {});

    describe("toJSON()", () => {
        let a: ObjectItem;
        let b: ObjectItem;
        let c: ObjectItem;
        let store: RefFilterStore;
        beforeEach(() => {
            [a, b, c] = [obj("id3n"), obj("f8x3"), obj("932c")];
            store = new RefFilterStore(
                {
                    ref: listReference(),
                    refOptions: list([a, b, c]),
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
        it.todo("restore state from JS array");
        it.todo("overrides any previous state");
    });

    describe("with 'fetchOptionsLazy' flag", () => {
        it.todo("should set limit to 0 on datasource");
        it.todo("should not change limit if flag is false");
    });

    describe("when datasource changed", () => {
        it.todo("discard any unknown selected GUIDs");
    });
});
