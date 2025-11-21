import { GateProvider } from "@mendix/widget-plugin-mobx-kit/main";
import { autorun } from "mobx";
import { hasMoreItemsAtom } from "../models/datasource.model.js";

describe("hasMoreItemsAtom", () => {
    it("reacts to datasource hasMoreItems changes", () => {
        const gateProvider = new GateProvider<{ datasource: { hasMoreItems?: boolean } }>({
            datasource: { hasMoreItems: undefined }
        });
        const atom = hasMoreItemsAtom(gateProvider.gate);
        const values: Array<boolean | undefined> = [];

        autorun(() => values.push(atom.get()));

        expect(values.at(0)).toBe(undefined);

        gateProvider.setProps({ datasource: { hasMoreItems: true } });
        gateProvider.setProps({ datasource: { hasMoreItems: false } });
        gateProvider.setProps({ datasource: { hasMoreItems: true } });
        gateProvider.setProps({ datasource: { hasMoreItems: undefined } });
        gateProvider.setProps({ datasource: { hasMoreItems: false } });

        expect(values).toEqual([undefined, true, false, true, undefined, false]);
    });
});
