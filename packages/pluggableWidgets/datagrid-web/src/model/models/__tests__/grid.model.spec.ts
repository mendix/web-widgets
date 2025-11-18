import { listExpression, obj } from "@mendix/widget-plugin-test-utils";
import { configure, isObservable, observable } from "mobx";
import { MainGateProps } from "../../../../typings/MainGateProps";
import { rowClassProvider } from "../grid.model";

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
