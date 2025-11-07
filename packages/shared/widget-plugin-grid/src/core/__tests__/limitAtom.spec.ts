import { GateProvider } from "@mendix/widget-plugin-mobx-kit/main";
import { autorun } from "mobx";
import { limitAtom } from "../models/datasource.model.js";

describe("limitAtom", () => {
    it("reacts to datasource limit changes", () => {
        const gateProvider = new GateProvider({ datasource: { limit: 10 } });
        const atom = limitAtom(gateProvider.gate);
        const values: number[] = [];

        autorun(() => values.push(atom.get()));

        expect(values.at(0)).toBe(10);

        gateProvider.setProps({ datasource: { limit: 25 } });
        gateProvider.setProps({ datasource: { limit: 50 } });
        gateProvider.setProps({ datasource: { limit: 5 } });
        gateProvider.setProps({ datasource: { limit: 10 } });
        gateProvider.setProps({ datasource: { limit: 100 } });

        expect(values).toEqual([10, 25, 50, 5, 10, 100]);
    });
});
