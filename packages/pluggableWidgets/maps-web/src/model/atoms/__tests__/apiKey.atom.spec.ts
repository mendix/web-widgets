import { runInAction } from "mobx";
import { GateProvider } from "@mendix/widget-plugin-mobx-kit/main";
import { MapsContainerProps } from "../../../../typings/MapsProps";
import { mockContainerProps } from "../../../utils/mock-container-props";
import { apiKeyAtom } from "../apiKey.atom";

describe("apiKeyAtom", () => {
    function setup(props: Partial<MapsContainerProps> = {}) {
        const provider = new GateProvider<MapsContainerProps>(mockContainerProps(props));
        const atom = apiKeyAtom(provider.gate);
        return { atom, provider };
    }

    it("returns apiKeyExp value when available", () => {
        const { atom } = setup({ apiKeyExp: { value: "exp-key" } as any });
        expect(atom.get()).toBe("exp-key");
    });

    it("falls back to static apiKey when expression is undefined", () => {
        const { atom } = setup({ apiKeyExp: undefined, apiKey: "static-key" });
        expect(atom.get()).toBe("static-key");
    });

    it("returns null when both are empty", () => {
        const { atom } = setup({ apiKeyExp: undefined, apiKey: "" });
        expect(atom.get()).toBeNull();
    });

    it("caches value once resolved and never reverts to null", () => {
        const provider = new GateProvider<MapsContainerProps>(
            mockContainerProps({ apiKeyExp: { value: "exp-key" } as any, apiKey: "" })
        );

        const atom = apiKeyAtom(provider.gate);
        expect(atom.get()).toBe("exp-key");

        runInAction(() => {
            provider.setProps(mockContainerProps({ apiKeyExp: { value: undefined } as any, apiKey: "" }));
        });

        expect(atom.get()).toBe("exp-key");
    });

    it("prioritizes expression over static", () => {
        const { atom } = setup({ apiKeyExp: { value: "exp-key" } as any, apiKey: "static-key" });
        expect(atom.get()).toBe("exp-key");
    });
});
