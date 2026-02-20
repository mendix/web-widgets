import { GateProvider } from "@mendix/widget-plugin-mobx-kit/GateProvider";
import { list } from "@mendix/widget-plugin-test-utils";
import { SelectionSingleValue } from "mendix";
import { mockContainerProps } from "../../../utils/mock-container-props";
import { CORE_TOKENS as CORE, GY_TOKENS as GY } from "../../tokens";
import { createGalleryContainer } from "../createGalleryContainer";
import { GalleryContainer } from "../Gallery.container";

describe("createGalleryContainer", () => {
    it("should create container with mock props", () => {
        const [container, gateProvider] = createGalleryContainer(mockContainerProps());

        expect(container).toBeInstanceOf(GalleryContainer);
        expect(gateProvider).toBeInstanceOf(GateProvider);
    });

    it("should bind main provider gate to the container", () => {
        const [container, gateProvider] = createGalleryContainer(mockContainerProps());

        expect(container.get(CORE.mainGate)).toBe(gateProvider.gate);
    });

    it("bind itemCount to computed value", () => {
        const [container] = createGalleryContainer(mockContainerProps());

        const itemsCount = container.get(CORE.data.itemCount);
        expect(itemsCount.get()).toBe(20);
    });

    it("should create selection helper", () => {
        const selection = { type: "Single", selection: undefined } as SelectionSingleValue;
        const [container] = createGalleryContainer({ ...mockContainerProps(), itemSelection: selection });
        const helper = container.get(GY.selectionHelper)!;
        expect(helper.type).toBe("Single");
        expect(helper.isSelected({ id: 42 } as any)).toBe(false);
    });

    it("reacts to datasource changes in itemCount", () => {
        const [container, gateProvider] = createGalleryContainer(mockContainerProps());

        const itemsCount = container.get(CORE.data.itemCount);

        expect(itemsCount.get()).toBe(20);

        gateProvider.setProps({
            ...mockContainerProps(),
            datasource: list(10)
        });

        expect(itemsCount.get()).toBe(10);
    });

    it("bind gallery config to the container", () => {
        const props = mockContainerProps();
        const [container] = createGalleryContainer(props);

        const config = container.get(CORE.config);
        expect(config).toBeDefined();
        expect(config).toMatchObject({
            name: "gallery_1",
            refreshIntervalMs: 0,
            selectionEnabled: false
        });
    });
});
