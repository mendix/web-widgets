import { observable } from "mobx";
import { SetupHost } from "@mendix/widget-plugin-mobx-kit/main";
import { EditableChartStore, EditableChartStoreProps } from "../EditableChart.store";

class TestHost extends SetupHost {}

function setupStore(initial: EditableChartStoreProps = { layout: {}, config: {}, data: [] }): {
    store: EditableChartStore;
    props: ReturnType<typeof observable.box<EditableChartStoreProps>>;
    dispose: () => void;
} {
    const props = observable.box<EditableChartStoreProps>(initial, { deep: false });
    const host = new TestHost();
    const store = new EditableChartStore(host, { get: () => props.get() });
    const dispose = host.setup();
    return { store, props, dispose };
}

describe("EditableChartStore", () => {
    it("loads layout, config and data from props on setup", () => {
        const { store, dispose } = setupStore({
            layout: { a: 1 },
            config: { b: 2 },
            data: [{ x: [1] }]
        });

        expect(store.layout).toEqual({ a: 1 });
        expect(store.config).toEqual({ b: 2 });
        expect(store.data).toEqual([{ x: [1] }]);

        dispose();
    });

    it("setDataAt replaces the trace at a valid index with parsed JSON", () => {
        const { store, dispose } = setupStore({
            layout: {},
            config: {},
            data: [{ x: [1] }, { x: [2] }]
        });
        const before = store.data;

        store.setDataAt(1, '{"x":[9]}');

        expect(store.data[0]).toEqual({ x: [1] });
        expect(store.data[1]).toEqual({ x: [9] });
        expect(store.data).not.toBe(before);

        dispose();
    });

    it("setDataAt ignores an out-of-range index without throwing", () => {
        const { store, dispose } = setupStore({ layout: {}, config: {}, data: [{ x: [1] }, { x: [2] }] });
        const before = store.data;

        store.setDataAt(5, '{"x":[9]}');
        store.setDataAt(-1, '{"x":[9]}');

        expect(store.data).toBe(before);

        dispose();
    });

    it("setDataAt swallows invalid JSON, keeps data, and warns", () => {
        const { store, dispose } = setupStore({ layout: {}, config: {}, data: [{ x: [1] }] });
        const before = store.data;
        const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);

        store.setDataAt(0, "{ not json ");

        expect(store.data).toBe(before);
        expect(warn).toHaveBeenCalledTimes(1);

        warn.mockRestore();
        dispose();
    });

    it("setDataAt rejects non-object JSON (array or primitive)", () => {
        const { store, dispose } = setupStore({ layout: {}, config: {}, data: [{ x: [1] }] });
        const before = store.data;

        store.setDataAt(0, "[1,2,3]");
        store.setDataAt(0, "42");

        expect(store.data).toBe(before);

        dispose();
    });

    it("setLayout ignores null and replaces on a real object", () => {
        const { store, dispose } = setupStore({ layout: { a: 1 }, config: {}, data: [] });

        store.setLayout(null as unknown as Record<string, unknown>);
        expect(store.layout).toEqual({ a: 1 });

        const before = store.layout;
        store.setLayout({ c: 3 });
        expect(store.layout).toEqual({ c: 3 });
        expect(store.layout).not.toBe(before);

        dispose();
    });

    it("setConfig ignores null and replaces on a real object", () => {
        const { store, dispose } = setupStore({ layout: {}, config: { b: 2 }, data: [] });

        store.setConfig(null as unknown as Record<string, unknown>);
        expect(store.config).toEqual({ b: 2 });

        store.setConfig({ d: 4 });
        expect(store.config).toEqual({ d: 4 });

        dispose();
    });

    it("exposes layout, config and data as JSON strings", () => {
        const { store, dispose } = setupStore({
            layout: { a: 1 },
            config: { b: 2 },
            data: [{ x: [1] }]
        });

        expect(store.layoutJson).toBe('{"a":1}');
        expect(store.configJson).toBe('{"b":2}');
        expect(store.dataJson).toEqual(['{"x":[1]}']);

        dispose();
    });
});
