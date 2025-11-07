import { DerivedGate, GateProvider } from "@mendix/widget-plugin-mobx-kit/main";
import { autorun } from "mobx";
import { totalCountAtom } from "../models/datasource.model.js";

describe("totalCountAtom", () => {
    it("returns -1 when datasource totalCount is undefined", () => {
        const gate = new DerivedGate({ props: { datasource: { totalCount: undefined } } });

        expect(totalCountAtom(gate).get()).toBe(-1);
    });

    it("returns correct count when datasource has totalCount", () => {
        const gate = new DerivedGate({ props: { datasource: { totalCount: 5 } } });

        expect(totalCountAtom(gate).get()).toBe(5);
    });

    it("returns 0 for totalCount of 0", () => {
        const gate = new DerivedGate({ props: { datasource: { totalCount: 0 } } });

        expect(totalCountAtom(gate).get()).toBe(0);
    });

    it("reacts to datasource totalCount changes", () => {
        const gateProvider = new GateProvider<{ datasource: { totalCount?: number } }>({
            datasource: { totalCount: undefined }
        });
        const atom = totalCountAtom(gateProvider.gate);
        const values: number[] = [];

        autorun(() => values.push(atom.get()));

        expect(values.at(0)).toBe(-1);

        gateProvider.setProps({ datasource: { totalCount: 5 } });
        gateProvider.setProps({ datasource: { totalCount: 2 } });
        gateProvider.setProps({ datasource: { totalCount: 0 } });
        gateProvider.setProps({ datasource: { totalCount: undefined } });
        gateProvider.setProps({ datasource: { totalCount: 3 } });

        expect(values).toEqual([-1, 5, 2, 0, -1, 3]);
    });
});
