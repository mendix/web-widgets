import { listExpression, obj } from "@mendix/widget-plugin-test-utils";
import { configure, isObservable, observable } from "mobx";
import { MainGateProps } from "../../../../typings/MainGateProps";
import { rowClassProvider, rowKeyProvider } from "../rows.model";

describe("rowClassProvider", () => {
    configure({
        enforceActions: "never"
    });

    it("returns empty string when rowClass is not defined", () => {
        const gate = observable({ props: {} as MainGateProps });
        const atom = rowClassProvider(gate);

        expect(atom.class.get(obj())).toBe("");
    });

    it("returns the class from rowClass expression", () => {
        const gate = observable({
            props: {
                rowClass: listExpression(() => "custom-row-class")
            } as MainGateProps
        });
        const atom = rowClassProvider(gate);

        expect(atom.class.get(obj())).toBe("custom-row-class");
    });

    it("updates reactively when rowClass expression changes", () => {
        const rowClassExpression = listExpression(() => "initial-class");
        const gate = observable({
            props: {
                rowClass: rowClassExpression
            } as MainGateProps
        });
        const atom = rowClassProvider(gate);

        expect(atom.class.get(obj())).toBe("initial-class");

        gate.props.rowClass = listExpression(() => "updated-class");
        expect(atom.class.get(obj())).toBe("updated-class");
    });

    it("class property is not observable itself", () => {
        const gate = observable({
            props: {
                rowClass: listExpression(() => "some-class")
            } as MainGateProps
        });

        const atom = rowClassProvider(gate);
        expect(isObservable(atom.class)).toBe(false);
    });
});

describe("rowKeyProvider", () => {
    configure({
        enforceActions: "never"
    });

    it("returns item.id when customRowKey is not defined", () => {
        const gate = observable({ props: {} as MainGateProps });
        const atom = rowKeyProvider(gate);
        const item = obj("fixed-id");

        expect(atom.key.get(item)).toBe(item.id);
    });

    it("returns item.id when customRowKey value is loading (undefined)", () => {
        const gate = observable({
            props: {
                customRowKey: listExpression(() => undefined as unknown as string)
            } as MainGateProps
        });
        const atom = rowKeyProvider(gate);
        const item = obj("fixed-id");

        expect(atom.key.get(item)).toBe(item.id);
    });

    it("returns the custom key when customRowKey has a value", () => {
        const gate = observable({
            props: {
                customRowKey: listExpression(() => "stable-key-123")
            } as MainGateProps
        });
        const atom = rowKeyProvider(gate);

        expect(atom.key.get(obj())).toBe("stable-key-123");
    });

    it("updates reactively when customRowKey expression changes", () => {
        const gate = observable({
            props: {
                customRowKey: listExpression(() => "initial-key")
            } as MainGateProps
        });
        const atom = rowKeyProvider(gate);

        expect(atom.key.get(obj())).toBe("initial-key");

        gate.props.customRowKey = listExpression(() => "updated-key");
        expect(atom.key.get(obj())).toBe("updated-key");
    });

    it("key property is not observable itself", () => {
        const gate = observable({
            props: {
                customRowKey: listExpression(() => "some-key")
            } as MainGateProps
        });

        const atom = rowKeyProvider(gate);
        expect(isObservable(atom.key)).toBe(false);
    });
});
