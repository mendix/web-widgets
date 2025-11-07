import { configure, observable } from "mobx";
import { selectedCountMulti } from "../models/selection.model.js";

describe("selectedCountMulti", () => {
    configure({
        enforceActions: "never"
    });

    it("returns selection length when type is Multi", () => {
        const gate = observable({ itemSelection: { type: "Multi", selection: [{ id: "1" }, { id: "2" }] } });
        const atom = selectedCountMulti(gate);
        expect(atom.get()).toBe(2);
    });

    it("returns -1 when type is Single", () => {
        const gate = observable({ itemSelection: { type: "Single", selection: [] } });
        const atom = selectedCountMulti(gate);
        expect(atom.get()).toBe(-1);
    });

    it("returns -1 when itemSelection is undefined", () => {
        const gate = observable({});
        const atom = selectedCountMulti(gate);
        expect(atom.get()).toBe(-1);
    });

    it("updates reactively when selection changes", () => {
        const gate = observable({ itemSelection: { type: "Multi", selection: [{ id: "1" }] } });
        const atom = selectedCountMulti(gate);

        expect(atom.get()).toBe(1);

        gate.itemSelection.selection.push({ id: "2" });
        expect(atom.get()).toBe(2);
    });
});
