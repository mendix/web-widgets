import { DerivedGate, GateProvider } from "@mendix/widget-plugin-mobx-kit/main";
import { list } from "@mendix/widget-plugin-test-utils";
import { ListValue } from "mendix";
import { autorun } from "mobx";
import { itemCountAtom } from "../models/datasource.model.js";

describe("itemCountAtom", () => {
    it("returns -1 when datasource items is undefined", () => {
        const gate = new DerivedGate({ props: { datasource: { items: undefined } } });

        expect(itemCountAtom(gate).get()).toBe(-1);
    });

    it("returns correct count when datasource has items", () => {
        const gate = new DerivedGate({ props: { datasource: list(5) } });

        expect(itemCountAtom(gate).get()).toBe(5);
    });

    it("returns 0 for empty items array", () => {
        const gate = new DerivedGate({ props: { datasource: list(0) } });

        expect(itemCountAtom(gate).get()).toBe(0);
    });

    it("reacts to datasource items changes", () => {
        const gateProvider = new GateProvider({ datasource: { items: undefined } as ListValue });
        const atom = itemCountAtom(gateProvider.gate);
        const values: number[] = [];

        autorun(() => values.push(atom.get()));

        expect(values.at(0)).toBe(-1);

        gateProvider.setProps({ datasource: list(5) });
        gateProvider.setProps({ datasource: list(2) });
        gateProvider.setProps({ datasource: list(0) });
        gateProvider.setProps({ datasource: { items: undefined } as ListValue });
        gateProvider.setProps({ datasource: list(3) });

        expect(values).toEqual([-1, 5, 2, 0, -1, 3]);
    });
});
