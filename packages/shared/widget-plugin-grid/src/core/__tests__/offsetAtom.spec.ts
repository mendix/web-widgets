import { GateProvider } from "@mendix/widget-plugin-mobx-kit/main";
import { autorun } from "mobx";
import { offsetAtom } from "../models/datasource.model.js";

describe("offsetAtom", () => {
    it("reacts to datasource offset changes", () => {
        const gateProvider = new GateProvider({ datasource: { offset: 0 } });
        const atom = offsetAtom(gateProvider.gate);
        const values: number[] = [];

        autorun(() => values.push(atom.get()));

        expect(values.at(0)).toBe(0);

        gateProvider.setProps({ datasource: { offset: 10 } });
        gateProvider.setProps({ datasource: { offset: 20 } });
        gateProvider.setProps({ datasource: { offset: 5 } });
        gateProvider.setProps({ datasource: { offset: 0 } });
        gateProvider.setProps({ datasource: { offset: 100 } });

        expect(values).toEqual([0, 10, 20, 5, 0, 100]);
    });
});
