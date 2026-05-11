import { listExpression, obj } from "@mendix/widget-plugin-test-utils";
import { configure, isObservable, observable } from "mobx";
import { GalleryGateProps } from "../../../typings/GalleryGateProps";
import { itemKeyProvider } from "../items.model";

describe("itemKeyProvider", () => {
    configure({
        enforceActions: "never"
    });

    it("returns item.id when customItemKey is not defined", () => {
        const gate = observable({ props: {} as GalleryGateProps });
        const atom = itemKeyProvider(gate);
        const item = obj("fixed-id");

        expect(atom.key.get(item)).toBe(item.id);
    });

    it("returns item.id when customItemKey value is loading (undefined)", () => {
        const gate = observable({
            props: {
                customItemKey: listExpression(() => undefined as unknown as string)
            } as GalleryGateProps
        });
        const atom = itemKeyProvider(gate);
        const item = obj("fixed-id");

        expect(atom.key.get(item)).toBe(item.id);
    });

    it("returns the custom key when customItemKey has a value", () => {
        const gate = observable({
            props: {
                customItemKey: listExpression(() => "stable-key-123")
            } as GalleryGateProps
        });
        const atom = itemKeyProvider(gate);

        expect(atom.key.get(obj())).toBe("stable-key-123");
    });

    it("updates reactively when customItemKey expression changes", () => {
        const gate = observable({
            props: {
                customItemKey: listExpression(() => "initial-key")
            } as GalleryGateProps
        });
        const atom = itemKeyProvider(gate);

        expect(atom.key.get(obj())).toBe("initial-key");

        gate.props.customItemKey = listExpression(() => "updated-key");
        expect(atom.key.get(obj())).toBe("updated-key");
    });

    it("key property is not observable itself", () => {
        const gate = observable({
            props: {
                customItemKey: listExpression(() => "some-key")
            } as GalleryGateProps
        });

        const atom = itemKeyProvider(gate);
        expect(isObservable(atom.key)).toBe(false);
    });
});
