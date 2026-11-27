import { LocalStoragePersonalizationStorage } from "../LocalStoragePersonalizationStorage";

describe("LocalStoragePersonalizationStorage", () => {
    afterEach(() => localStorage.clear());

    it("reads no settings when the key is not stored", () => {
        expect(new LocalStoragePersonalizationStorage("grid_1").settings).toBeUndefined();
    });

    it("reads settings parsed from localStorage", () => {
        localStorage.setItem("grid_1", '{"name":"grid"}');

        expect(new LocalStoragePersonalizationStorage("grid_1").settings).toEqual({ name: "grid" });
    });

    it("writes settings to localStorage as JSON under its key", () => {
        const storage = new LocalStoragePersonalizationStorage("grid_1");

        storage.updateSettings({ name: "grid" });

        expect(localStorage.getItem("grid_1")).toBe('{"name":"grid"}');
        expect(storage.settings).toEqual({ name: "grid" });
    });

    it("keeps settings of different keys apart", () => {
        new LocalStoragePersonalizationStorage("grid_1").updateSettings({ v: 1 });
        new LocalStoragePersonalizationStorage("grid_2").updateSettings({ v: 2 });

        expect(new LocalStoragePersonalizationStorage("grid_1").settings).toEqual({ v: 1 });
        expect(new LocalStoragePersonalizationStorage("grid_2").settings).toEqual({ v: 2 });
    });

    it("current behaviour: throws when the stored value is invalid JSON", () => {
        localStorage.setItem("grid_1", "{not json");

        expect(() => new LocalStoragePersonalizationStorage("grid_1").settings).toThrow(SyntaxError);
    });
});
