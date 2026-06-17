import { runInAction } from "mobx";
import { GateProvider } from "@mendix/widget-plugin-mobx-kit/main";
import { MapsContainerProps } from "../../../../typings/MapsProps";
import { mockContainerProps } from "../../../utils/mock-container-props";
import { geodecodeApiKeyAtom } from "../geodecodeApiKey.atom";

describe("geodecodeApiKeyAtom", () => {
    function setup(props: Partial<MapsContainerProps> = {}) {
        const provider = new GateProvider<MapsContainerProps>(mockContainerProps(props));
        const atom = geodecodeApiKeyAtom(provider.gate);
        return { atom, provider };
    }

    it("returns geodecodeApiKeyExp value when available", () => {
        const { atom } = setup({ geodecodeApiKeyExp: { value: "geo-exp-key" } as any });
        expect(atom.get()).toBe("geo-exp-key");
    });

    it("falls back to static geodecodeApiKey when expression is undefined", () => {
        const { atom } = setup({ geodecodeApiKeyExp: undefined, geodecodeApiKey: "geo-static-key" });
        expect(atom.get()).toBe("geo-static-key");
    });

    it("returns null when both are empty", () => {
        const { atom } = setup({ geodecodeApiKeyExp: undefined, geodecodeApiKey: "" });
        expect(atom.get()).toBeNull();
    });

    it("caches value once resolved and never reverts to null", () => {
        const provider = new GateProvider<MapsContainerProps>(
            mockContainerProps({ geodecodeApiKeyExp: { value: "geo-exp-key" } as any, geodecodeApiKey: "" })
        );

        const atom = geodecodeApiKeyAtom(provider.gate);
        expect(atom.get()).toBe("geo-exp-key");

        runInAction(() => {
            provider.setProps(
                mockContainerProps({ geodecodeApiKeyExp: { value: undefined } as any, geodecodeApiKey: "" })
            );
        });

        expect(atom.get()).toBe("geo-exp-key");
    });

    it("prioritizes expression over static", () => {
        const { atom } = setup({
            geodecodeApiKeyExp: { value: "geo-exp-key" } as any,
            geodecodeApiKey: "geo-static-key"
        });
        expect(atom.get()).toBe("geo-exp-key");
    });
});
