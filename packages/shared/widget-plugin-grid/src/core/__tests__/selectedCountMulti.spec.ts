import { configure, observable } from "mobx";
import { selectedCountMultiAtom } from "../models/selection.model.js";

describe("selectedCountMulti", () => {
    configure({
        enforceActions: "never"
    });

    it("returns selection length when type is Multi", () => {
        const gate = observable({
            props: { itemSelection: { type: "Multi" as const, selection: [{ id: "1" }, { id: "2" }] } }
        });
        const atom = selectedCountMultiAtom(gate);
        expect(atom.get()).toBe(2);
    });

    it("returns -1 when type is Single", () => {
        const gate = observable({ props: { itemSelection: { type: "Single" as const, selection: [] } } });
        const atom = selectedCountMultiAtom(gate);
        expect(atom.get()).toBe(-1);
    });

    it("returns -1 when itemSelection is undefined", () => {
        const gate = observable({ props: {} });
        const atom = selectedCountMultiAtom(gate);
        expect(atom.get()).toBe(-1);
    });

    it("updates reactively when selection changes", () => {
        const gate = observable({ props: { itemSelection: { type: "Multi" as const, selection: [{ id: "1" }] } } });
        const atom = selectedCountMultiAtom(gate);

        expect(atom.get()).toBe(1);

        gate.props.itemSelection.selection.push({ id: "2" });
        expect(atom.get()).toBe(2);
    });
});
