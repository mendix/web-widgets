import { editable } from "@mendix/widget-plugin-test-utils";
import { AttributePersonalizationStorage } from "../AttributePersonalizationStorage";

describe("AttributePersonalizationStorage", () => {
    it("reads settings parsed from the attribute value", () => {
        const storage = new AttributePersonalizationStorage({
            configurationAttribute: editable.with('{"name":"grid"}')
        });

        expect(storage.settings).toEqual({ name: "grid" });
    });

    it("reads no settings when there is no attribute", () => {
        const storage = new AttributePersonalizationStorage({ configurationAttribute: undefined });

        expect(storage.settings).toBeUndefined();
    });

    it("reads no settings while the attribute is loading", () => {
        const storage = new AttributePersonalizationStorage({
            configurationAttribute: editable<string>(b => b.withValue('{"name":"grid"}').isLoading().build())
        });

        expect(storage.settings).toBeUndefined();
    });

    it("reads no settings from an empty attribute", () => {
        const storage = new AttributePersonalizationStorage({ configurationAttribute: editable.with("") });

        expect(storage.settings).toBeUndefined();
    });

    it("current behaviour: throws when the attribute holds invalid JSON", () => {
        const storage = new AttributePersonalizationStorage({ configurationAttribute: editable.with("{not json") });

        expect(() => storage.settings).toThrow(SyntaxError);
    });

    it("writes settings to the attribute as JSON", () => {
        const attr = editable<string>();
        const storage = new AttributePersonalizationStorage({ configurationAttribute: attr });

        storage.updateSettings({ name: "grid" });

        expect(attr.setValue).toHaveBeenCalledWith('{"name":"grid"}');
        expect(storage.settings).toEqual({ name: "grid" });
    });

    it("does not write when the value is unchanged", () => {
        const attr = editable.with('{"name":"grid"}');
        const storage = new AttributePersonalizationStorage({ configurationAttribute: attr });

        storage.updateSettings({ name: "grid" });

        expect(attr.setValue).not.toHaveBeenCalled();
    });

    it("does not write to a read-only attribute", () => {
        const attr = editable<string>(b => b.isReadOnly().build());
        const storage = new AttributePersonalizationStorage({ configurationAttribute: attr });

        storage.updateSettings({ name: "grid" });

        expect(attr.setValue).not.toHaveBeenCalled();
    });

    it.each([null, ""])("writes undefined instead of %p", empty => {
        const attr = editable.with('{"name":"grid"}');
        const storage = new AttributePersonalizationStorage({ configurationAttribute: attr });

        storage.updateSettings(empty);

        expect(attr.setValue).toHaveBeenCalledWith(undefined);
    });

    it("reads and writes through the attribute from the latest props", () => {
        const storage = new AttributePersonalizationStorage({ configurationAttribute: editable.with('{"v":1}') });
        const next = editable.with('{"v":2}');

        storage.updateProps({ configurationAttribute: next });
        storage.updateSettings({ v: 3 });

        expect(next.setValue).toHaveBeenCalledWith('{"v":3}');
        expect(storage.settings).toEqual({ v: 3 });
    });
});
