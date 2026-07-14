import { DynamicValue, ObjectItem } from "mendix";
import { getChannelName } from "../utils/getChannelName";

function makeObjectSource(value?: ObjectItem): DynamicValue<ObjectItem> {
    return { value } as DynamicValue<ObjectItem>;
}

function makeObjectItem(entityName: string, guid: string): ObjectItem {
    const mxObject = { getEntity: () => entityName };
    const sym = Symbol("mxObject");
    const item = { id: guid, [sym]: mxObject } as unknown as ObjectItem;
    Object.defineProperty(item, sym, { value: mxObject, enumerable: false });
    // Place symbol as first own symbol so extractEntityName finds it
    return item;
}

describe("getChannelName", () => {
    it("returns undefined when objectSource has no value", () => {
        expect(getChannelName(makeObjectSource(undefined))).toBeUndefined();
    });

    it("returns private channel name for valid object", () => {
        const item = makeObjectItem("MyModule.MyEntity", "guid-123");
        expect(getChannelName(makeObjectSource(item))).toBe("private-MyModule.MyEntity.guid-123");
    });

    it("throws when mxObject symbol is absent", () => {
        const item = { id: "guid-123" } as unknown as ObjectItem;
        expect(() => getChannelName(makeObjectSource(item))).toThrow("Unable to extract entity name");
    });

    it("returns undefined when guid is empty", () => {
        const item = makeObjectItem("MyModule.MyEntity", "");
        expect(getChannelName(makeObjectSource(item))).toBeUndefined();
    });
});
