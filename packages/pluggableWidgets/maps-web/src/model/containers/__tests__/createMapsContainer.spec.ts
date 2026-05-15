import { GateProvider } from "@mendix/widget-plugin-mobx-kit/GateProvider";
import { mockContainerProps } from "../../../utils/mock-container-props";
import { CORE_TOKENS as CORE } from "../../tokens";
import { createMapsContainer } from "../createMapsContainer";
import { MapsContainer } from "../Maps.container";

describe("createMapsContainer", () => {
    it("should create container with mock props", () => {
        const [container, gateProvider] = createMapsContainer(mockContainerProps());

        expect(container).toBeInstanceOf(MapsContainer);
        expect(gateProvider).toBeInstanceOf(GateProvider);
    });

    it("should bind main provider gate to the container", () => {
        const [container, gateProvider] = createMapsContainer(mockContainerProps());

        expect(container.get(CORE.mainGate)).toBe(gateProvider.gate);
    });

    it("should bind config to container with derived values from props", () => {
        const props = mockContainerProps({ name: "testMap", apiKeyExp: { value: "my-key" } as any });
        const [container] = createMapsContainer(props);

        const config = container.get(CORE.config);
        expect(config.name).toBe("testMap");
        expect(config.apiKey).toBe("my-key");
        expect(config.id).toContain("testMap:Maps@");
    });

    it("should properly isolate bindings between multiple containers", () => {
        const props1 = mockContainerProps({ name: "map1", apiKeyExp: { value: "key1" } as any });
        const props2 = mockContainerProps({ name: "map2", apiKeyExp: { value: "key2" } as any });

        const [container1] = createMapsContainer(props1);
        const [container2] = createMapsContainer(props2);

        const config1 = container1.get(CORE.config);
        const config2 = container2.get(CORE.config);

        // Each container should have independent state
        expect(config1.name).toBe("map1");
        expect(config1.apiKey).toBe("key1");
        expect(config2.name).toBe("map2");
        expect(config2.apiKey).toBe("key2");
        expect(config1).not.toBe(config2);
    });
});
