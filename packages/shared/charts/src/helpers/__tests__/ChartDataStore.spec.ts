import { autorun } from "mobx";
import { ChartDataStore } from "../ChartDataStore";

describe("initial state and JSON outputs", () => {
    it("should contain initial state and JSON outputs", () => {
        const store = new ChartDataStore();
        expect(store.layout).toEqual({});
        expect(store.config).toEqual({});
        expect(store.data).toEqual([]);
        expect(store.layoutJson).toBe("{}");
        expect(store.configJson).toBe("{}");
        expect(store.dataJson).toBe("[]");
    });
});

describe("update layout/config/data and keep JSON in sync", () => {
    it("should update layout/config/data and keep JSON in sync", () => {
        const store = new ChartDataStore();
        store.setLayout({ title: "Test" });
        store.setConfig({ type: "bar" });
        store.setData([
            { label: "A", value: 10 },
            { label: "B", value: 20 }
        ]);

        expect(store.layoutJson).toBe('{"title":"Test"}');
        expect(store.configJson).toBe('{"type":"bar"}');
        expect(store.dataJson).toBe('[{"label":"A","value":10},{"label":"B","value":20}]');
    });

    it("should parse JSON string and set data at index", () => {
        const store = new ChartDataStore();
        store.setData([{ id: 1, value: 10 }]);
        store.setDataAt(0, '{"id":2,"value":40}');
        expect(store.dataJson).toBe('[{"id":2,"value":40}]');
    });

    it("should handle setDataAt with invalid JSON gracefully", () => {
        const store = new ChartDataStore();
        store.setData([{ id: 1, value: 10 }]);
        store.setDataAt(1, "invalid json");
        expect(store.dataJson).toBe('[{"id":1,"value":10}]');
    });

    it("should ignore setDataAt if parsed result is an array", () => {
        const store = new ChartDataStore();
        store.setData([{ id: 1, value: 10 }]);
        store.setDataAt(1, '["not", "an", "object"]');
        expect(store.dataJson).toBe('[{"id":1,"value":10}]');
    });

    it("should throw error for non-array data in setData", () => {
        const store = new ChartDataStore();
        expect(() => store.setData({ invalid: "data" } as any)).toThrow();
    });
});

describe("JSON getters", () => {
    it("should return correct JSON strings for layout", () => {
        const store = new ChartDataStore();
        store.setLayout({ title: "Demo" });
        expect(store.layoutJson).toBe('{"title":"Demo"}');
    });

    it("should return correct JSON strings for config", () => {
        const store = new ChartDataStore();
        store.setConfig({ type: "pie" });
        expect(store.configJson).toBe('{"type":"pie"}');
    });

    it("should return correct JSON strings for data", () => {
        const store = new ChartDataStore();
        store.setData([
            { label: "A", value: 10 },
            { label: "B", value: 20 }
        ]);
        expect(store.dataJson).toBe('[{"label":"A","value":10},{"label":"B","value":20}]');
    });
});

describe("null/undefined handling", () => {
    it("should not set layout for null or undefined values", () => {
        const store = new ChartDataStore();
        store.setLayout({ initial: "true" });
        store.setLayout(null as any);
        expect(store.layoutJson).toBe('{"initial":"true"}');
    });

    it("should not set config for null or undefined values", () => {
        const store = new ChartDataStore();
        store.setConfig({ mode: "dark" });
        store.setConfig(undefined as any);
        expect(store.configJson).toBe('{"mode":"dark"}');
    });
});

describe("reset method", () => {
    it("should reset all fields using reset method", () => {
        const store = new ChartDataStore();
        store.setLayout({ old: "value" });
        store.setConfig({ old: "value" });
        store.setData([{ old: "value" }]);

        store.reset({ new: "value" }, { new: "value" }, [{ new: "value" }]);

        expect(store.layoutJson).toBe('{"new":"value"}');
        expect(store.configJson).toBe('{"new":"value"}');
        expect(store.dataJson).toBe('[{"new":"value"}]');
    });
});

describe("reactive updates with MobX", () => {
    it("reactively updates layoutJson when layout changes", () => {
        const store = new ChartDataStore();
        const loggedValues: string[] = [];
        autorun(() => loggedValues.push(store.layoutJson));
        expect(loggedValues).toEqual(["{}"]);
        store.setLayout({ title: "First" });
        expect(loggedValues).toEqual(["{}", '{"title":"First"}']);
        store.setLayout({ title: "Updated" });
        expect(loggedValues).toEqual(["{}", '{"title":"First"}', '{"title":"Updated"}']);
    });

    it("reactively updates dataJson when data changes", () => {
        const store = new ChartDataStore();
        const loggedValues: string[] = [];
        autorun(() => loggedValues.push(store.dataJson));
        expect(loggedValues).toEqual(["[]"]);
        store.setData([{ id: 1, value: 5 }]);
        expect(loggedValues.length).toBeGreaterThan(1);
        store.setData([
            { id: 1, value: 5 },
            { id: 2, value: 10 }
        ]);
        expect(loggedValues.length).toBeGreaterThan(2);
    });

    it("reactively updates configJson when config changes", () => {
        const store = new ChartDataStore();
        const loggedValues: string[] = [];
        autorun(() => loggedValues.push(store.configJson));
        expect(loggedValues).toEqual(["{}"]);
        store.setConfig({ mode: "dark" });
        expect(loggedValues).toEqual(["{}", '{"mode":"dark"}']);
        store.setConfig({ mode: "light" });
        expect(loggedValues).toEqual(["{}", '{"mode":"dark"}', '{"mode":"light"}']);
    });

    it("reactively updates store after reset", () => {
        const store = new ChartDataStore();
        const logged: Array<Record<string, string>> = [];
        autorun(() => {
            logged.push({
                layout: store.layoutJson,
                config: store.configJson,
                data: store.dataJson
            });
        });
        expect(logged).toEqual([
            {
                layout: "{}",
                config: "{}",
                data: "[]"
            }
        ]);
        store.setLayout({ initial: "true" });
        store.setConfig({ setting: "on" });
        store.setData([{ item: "one" }]);
        expect(logged.length).toBeGreaterThan(1);
        store.reset({ reset: "layout" }, { reset: "config" }, [{ reset: "data" }]);
        expect(logged.length).toBeGreaterThan(2);
    });
});
