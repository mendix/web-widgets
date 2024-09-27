import { ObjectItem } from "mendix";
import { list, listReference, listExpression, obj, cases } from "@mendix/widget-plugin-test-utils";
import { RefFilterStore } from "../stores/RefFilterStore";
import { autorun, _resetGlobalState } from "mobx";

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
                    refOptions: list(items),
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

    describe("get condition()", () => {});

    describe("toJSON()", () => {
        let store: RefFilterStore;
        beforeEach(() => {
            store = new RefFilterStore(
                {
                    ref: listReference(),
                    refOptions: list(3),
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
                    refOptions: list([obj("id3n"), obj("f8x3"), obj("932c")]),
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
    });

    describe("with 'fetchOptionsLazy' flag", () => {
        it.todo("should set limit to 0 on datasource");
        it.todo("should not change limit if flag is false");
    });

    describe("when datasource changed", () => {
        it.todo("discard any unknown selected GUIDs");

        it("compute new options", () => {
            const a = obj("id3n");
            const mapItem = cases([a, "Alice"], [undefined, "No caption"]);
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
    });
});
