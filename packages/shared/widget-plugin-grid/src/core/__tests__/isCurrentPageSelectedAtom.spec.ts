import { configure, observable } from "mobx";
import { isCurrentPageSelectedAtom } from "../models/selection.model.js";

describe("isCurrentPageSelectedAtom", () => {
    configure({
        enforceActions: "never"
    });

    it("returns true when all current page items are selected", () => {
        const gate = observable({
            props: {
                itemSelection: { type: "Multi" as const, selection: [{ id: "1" }, { id: "2" }] },
                datasource: { items: [{ id: "1" }, { id: "2" }] }
            }
        });
        const atom = isCurrentPageSelectedAtom(gate);
        expect(atom.get()).toBe(true);
    });

    it("returns false when only some page items are selected", () => {
        const gate = observable({
            props: {
                itemSelection: { type: "Multi" as const, selection: [{ id: "1" }] },
                datasource: { items: [{ id: "1" }, { id: "2" }] }
            }
        });
        const atom = isCurrentPageSelectedAtom(gate);
        expect(atom.get()).toBe(false);
    });

    it("returns false when selection type is Single", () => {
        const gate = observable({
            props: {
                itemSelection: { type: "Single" as const },
                datasource: { items: [{ id: "1" }] }
            }
        });
        const atom = isCurrentPageSelectedAtom(gate);
        expect(atom.get()).toBe(false);
    });

    it("returns false when itemSelection is undefined", () => {
        const gate = observable({
            props: {
                datasource: { items: [{ id: "1" }] }
            }
        });
        const atom = isCurrentPageSelectedAtom(gate);
        expect(atom.get()).toBe(false);
    });

    it("returns false when there are no items", () => {
        const gate = observable({
            props: {
                itemSelection: { type: "Multi" as const, selection: [] },
                datasource: { items: [] }
            }
        });
        const atom = isCurrentPageSelectedAtom(gate);
        expect(atom.get()).toBe(false);
    });

    it("updates reactively when selection changes", () => {
        const gate = observable({
            props: {
                itemSelection: { type: "Multi" as const, selection: [{ id: "1" }] },
                datasource: { items: [{ id: "1" }, { id: "2" }] }
            }
        });
        const atom = isCurrentPageSelectedAtom(gate);

        expect(atom.get()).toBe(false);

        gate.props.itemSelection.selection.push({ id: "2" });
        expect(atom.get()).toBe(true);
    });
});
