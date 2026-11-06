jest.mock(
    "mendix/filters/builders",
    () => {
        const node =
            (type: string) =>
            (...args: unknown[]) => ({ type, args });
        return {
            association: node("association"),
            attribute: node("attribute"),
            contains: node("contains"),
            equals: node("equals"),
            literal: node("literal"),
            or: node("or"),
            and: node("and"),
            notEqual: node("notEqual")
        };
    },
    { virtual: true }
);

import { AssociationMetaData, AttributeMetaData, ListValue, ObjectItem } from "mendix";
import { GateProvider } from "@mendix/widget-plugin-mobx-kit/GateProvider";
import { RefFilterStore, RefFilterStoreProps } from "../stores/RefFilterStore";

// describe("RefFilterStore", () => {
//     afterEach(() => _resetGlobalState());

//     describe("get options()", () => {
//         let items: ObjectItem[];
//         let mapItem: (item: ObjectItem) => string;
//         let store: RefFilterStore;
//         beforeEach(() => {
//             const [a, b, c] = [obj("id3n"), obj("f8x3"), obj("932c")];
//             items = [a, b, c];
//             mapItem = cases([a, "Alice"], [b, "Bob"], [c, "Chuck"], [undefined, "No caption"]);
//             store = new RefFilterStore(
//                 {
//                     ref: listReference(),
//                     datasource: list(items),
//                     caption: listExpression(mapItem)
//                 },
//                 null
//             );
//         });

//         it("returns array of options", () => {
//             expect(store.options).toMatchInlineSnapshot(`
//                 [
//                   {
//                     "caption": "Alice",
//                     "selected": false,
//                     "value": "obj_id3n",
//                   },
//                   {
//                     "caption": "Bob",
//                     "selected": false,
//                     "value": "obj_f8x3",
//                   },
//                   {
//                     "caption": "Chuck",
//                     "selected": false,
//                     "value": "obj_932c",
//                   },
//                 ]
//             `);
//         });
//     });

//     describe("get condition()", () => {
//         it.todo("return filter condition using equals");
//     });

//     describe("toJSON()", () => {
//         let store: RefFilterStore;
//         beforeEach(() => {
//             store = new RefFilterStore(
//                 {
//                     ref: listReference(),
//                     datasource: list(3),
//                     caption: listExpression(() => "[string]")
//                 },
//                 null
//             );
//         });

//         it("returns state as JS array", () => {
//             expect(store.toJSON()).toEqual([]);
//         });

//         it("save state with one item", () => {
//             const guid = store.options[0].value;
//             store.toggle(guid);
//             expect(store.toJSON()).toEqual([guid]);
//         });

//         it("save state with multiple items", () => {
//             const [guid1, guid2] = [store.options[0].value, store.options[1].value];
//             store.toggle(guid1);
//             store.toggle(guid2);
//             const output = store.toJSON();

//             expect(output).toHaveLength(2);
//             expect(output).toContain(guid1);
//             expect(output).toContain(guid2);
//         });
//     });

//     describe("fromJSON()", () => {
//         let store: RefFilterStore;
//         beforeEach(() => {
//             store = new RefFilterStore(
//                 {
//                     ref: listReference(),
//                     datasource: list([obj("id3n"), obj("f8x3"), obj("932c")]),
//                     caption: listExpression(() => "[string]")
//                 },
//                 null
//             );
//         });

//         it("restore state from JS array", () => {
//             const output: Array<typeof store.options> = [];
//             autorun(() => output.push(store.options));

//             // Check that every option is unselected
//             expect(output[0].map(option => option.selected)).toEqual([false, false, false]);
//             // Restore state
//             store.fromJSON(["obj_id3n"]);
//             // Check that first option is selected
//             expect(output[1].map(option => option.selected)).toEqual([true, false, false]);
//         });

//         it("overrides any previous state", () => {
//             const output: Array<typeof store.options> = [];

//             // Select each option
//             store.options.forEach(option => {
//                 store.toggle(option.value);
//             });
//             // Start observing
//             autorun(() => output.push(store.options));
//             // Check the state
//             expect(output[0].map(option => option.selected)).toEqual([true, true, true]);
//             store.fromJSON(["obj_932c"]);
//             expect(output[1].map(option => option.selected)).toEqual([false, false, true]);
//         });

//         it("should not change state if json is null", () => {
//             const state = store.toJSON();
//             store.fromJSON(null);
//             expect(store.toJSON()).toEqual(state);
//         });
//     });

//     describe("toggle()", () => {
//         let store: RefFilterStore;
//         beforeEach(() => {
//             store = new RefFilterStore(
//                 {
//                     ref: listReference(),
//                     datasource: list([obj("id3n"), obj("f8x3"), obj("932c")]),
//                     caption: listExpression(() => "[string]")
//                 },
//                 null
//             );
//         });

//         it("compute new options", () => {
//             const output: Array<typeof store.options> = [];
//             const [x, y] = store.options;

//             autorun(() => output.push(store.options));
//             expect(output[0].map(opt => opt.selected)).toEqual([false, false, false]);

//             store.toggle(x.value);
//             store.toggle(y.value);
//             expect(output[2].map(opt => opt.selected)).toEqual([true, true, false]);

//             store.toggle(x.value);
//             expect(output[3].map(opt => opt.selected)).toEqual([false, true, false]);
//         });
//     });

//     describe("with 'fetchOptionsLazy' flag", () => {
//         it("should set limit to 0 on options datasource", () => {
//             const datasource = list.loading();
//             const props = {
//                 ref: listReference(),
//                 datasource,
//                 caption: listExpression(() => "[string]"),
//                 fetchOptionsLazy: true
//             };

//             new RefFilterStore(props, null);

//             expect(datasource.setLimit).toHaveBeenLastCalledWith(0);
//         });

//         it("should not change limit if flag is false", () => {
//             const datasource = list.loading();
//             const props = {
//                 ref: listReference(),
//                 datasource,
//                 caption: listExpression(() => "[string]"),
//                 fetchOptionsLazy: false
//             };

//             new RefFilterStore(props, null);

//             expect(datasource.setLimit).not.toHaveBeenCalled();
//         });
//     });

//     describe("when datasource changed", () => {
//         it("compute new options", () => {
//             const a = obj("id3n");
//             const props = {
//                 ref: listReference(),
//                 datasource: list.loading(),
//                 caption: listExpression(cases([a, "Alice"], [undefined, "No caption"]))
//             };
//             const store = new RefFilterStore(props, null);
//             const output: any[] = [];
//             autorun(() => output.push(store.options));

//             expect(output[0]).toEqual([]);
//             store.updateProps({ ...props, datasource: list([a]) });
//             expect(output[1]).toEqual([
//                 {
//                     caption: "Alice",
//                     selected: false,
//                     value: "obj_id3n"
//                 }
//             ]);
//         });
//     });

//     describe("json data filtering", () => {
//         const savedJson = ["obj_xx", "obj_xiii", "obj_deleted", "obj_yy", "obj_unknown"];
//         let a: ObjectItem;
//         let b: ObjectItem;
//         let props: Omit<RefFilterStoreProps, "datasource">;
//         beforeEach(() => {
//             a = obj("xx");
//             b = obj("yy");
//             props = {
//                 ref: listReference(),
//                 caption: listExpression(() => "[string]")
//             };
//         });

//         it("skip filtering if has just part of the list", () => {
//             const store = new RefFilterStore({ ...props, datasource: list.loading() }, null);
//             // Restore state
//             store.fromJSON(savedJson);
//             // Check state
//             expect(store.toJSON()).toEqual(savedJson);
//             // Update with partial data
//             const datasource = new ListValueBuilder().withItems([a, b]).withHasMore(true).build();
//             store.updateProps({ ...props, datasource });
//             // Check that state still has unknown GUIDs
//             expect(store.toJSON()).toEqual(savedJson);
//         });

//         it("allows to restore any state if datasource is loading", () => {
//             const store = new RefFilterStore({ ...props, datasource: list.loading() }, null);
//             // Restore state
//             store.fromJSON(savedJson);
//             // Check state
//             expect(store.toJSON()).toEqual(savedJson);
//         });
//     });
// });

describe("RefFilterStore", () => {
    describe("options datasource limit", () => {
        beforeEach(() => jest.useFakeTimers());
        afterEach(() => jest.useRealTimers());

        it("does not change the limit in the constructor when lazy loading is off", () => {
            const { datasource } = setupStore({ fetchOptionsLazy: false }, { run: false });
            expect(datasource.setLimit).not.toHaveBeenCalled();
        });

        it("resets a restored limit to the default on setup when lazy loading is off", () => {
            // The runtime restores the last used limit when the user returns to the page.
            const { datasource } = setupStore({ fetchOptionsLazy: false }, { limit: 100 });
            expect(datasource.setLimit).toHaveBeenCalledTimes(1);
            expect(datasource.setLimit).toHaveBeenLastCalledWith(undefined);
        });

        it("does not limit options on search or search clear when lazy loading is off", () => {
            const { store, datasource } = setupStore({ fetchOptionsLazy: false });
            datasource.setLimit.mockClear();

            store.search.setBuffer("ZZAccount");
            jest.advanceTimersByTime(SEARCH_DELAY);
            expect(datasource.setFilter).toHaveBeenCalledTimes(1);

            store.search.clear();
            jest.advanceTimersByTime(SEARCH_DELAY);
            expect(datasource.setFilter).toHaveBeenCalledTimes(2);
            expect(datasource.setFilter).toHaveBeenLastCalledWith(undefined);

            expect(datasource.setLimit).not.toHaveBeenCalled();
        });

        it("sets limit to 0 in the constructor when lazy loading is on", () => {
            const { datasource } = setupStore({ fetchOptionsLazy: true }, { run: false });
            expect(datasource.setLimit).toHaveBeenLastCalledWith(0);
        });

        it("limits options on search when lazy loading is on", () => {
            const { store, datasource } = setupStore({ fetchOptionsLazy: true });
            datasource.setLimit.mockClear();

            store.search.setBuffer("ZZAccount");
            jest.advanceTimersByTime(SEARCH_DELAY);

            expect(datasource.setLimit).toHaveBeenLastCalledWith(100);
        });
    });

    describe("selected options", () => {
        it("shows the caption of a restored selection outside the first 100 options", () => {
            const items = Array.from({ length: 150 }, (_, i) => item(`obj_${i}`));
            const { store } = setupStore({ fetchOptionsLazy: false }, { items });

            store.fromJSON(["obj_149"]);

            expect(store.selectedOptions).toEqual([{ caption: "Caption obj_149", value: "obj_149", selected: true }]);
        });
    });
});

const SEARCH_DELAY = 300;

type MockListValue = ListValue & { setLimit: jest.Mock; setFilter: jest.Mock };

function item(id: string): ObjectItem {
    return { id } as ObjectItem;
}

function mockList({
    items = [],
    limit = Number.POSITIVE_INFINITY
}: {
    items?: ObjectItem[];
    limit?: number;
}): MockListValue {
    const list = {
        status: "available",
        items,
        limit,
        offset: 0,
        hasMoreItems: false,
        filter: undefined,
        setFilter: jest.fn(),
        setOffset: jest.fn(),
        setSortOrder: jest.fn(),
        requestTotalCount: jest.fn(),
        reload: jest.fn()
    } as unknown as MockListValue;
    list.setLimit = jest.fn((next?: number) => {
        (list as { limit: number }).limit = next ?? Number.POSITIVE_INFINITY;
    });
    return list;
}

function setupStore(
    props: Pick<RefFilterStoreProps, "fetchOptionsLazy">,
    { items, limit, run = true }: { items?: ObjectItem[]; limit?: number; run?: boolean } = {}
): { store: RefFilterStore; datasource: MockListValue } {
    const datasource = mockList({ items, limit });
    const gateProvider = new GateProvider<RefFilterStoreProps>({
        ...props,
        refEntity: { id: "Module.Task_Account" } as unknown as AssociationMetaData,
        refCaption: { get: (obj: ObjectItem) => ({ value: `Caption ${obj.id}` }) },
        refOptions: datasource,
        searchAttrId: "Module.Account.Name" as AttributeMetaData["id"]
    });
    const store = new RefFilterStore({ gate: gateProvider.gate, initCond: null });
    if (run) {
        disposers.push(store.setup());
    }
    return { store, datasource };
}

const disposers: Array<() => void> = [];
afterEach(() => disposers.splice(0).forEach(dispose => dispose()));
