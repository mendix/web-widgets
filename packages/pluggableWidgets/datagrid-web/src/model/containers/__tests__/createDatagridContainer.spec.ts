import { list } from "@mendix/widget-plugin-test-utils";
import { SelectAllModule } from "../../../features/select-all/SelectAllModule.container";
import { mockContainerProps } from "../../../utils/test-utils";
import { MainGateProvider } from "../../services/MainGateProvider.service";
import { CORE_TOKENS as CORE } from "../../tokens";
import { createDatagridContainer } from "../createDatagridContainer";
import { DatagridContainer } from "../Datagrid.container";

describe("createDatagridContainer", () => {
    it("should create container with mock props", () => {
        const [container, selectAllModule, mainProvider] = createDatagridContainer(mockContainerProps());

        expect(container).toBeInstanceOf(DatagridContainer);
        expect(selectAllModule).toBeInstanceOf(SelectAllModule);
        expect(mainProvider).toBeInstanceOf(MainGateProvider);
    });

    it("should bind main provider gate to the container", () => {
        const [container, , mainProvider] = createDatagridContainer(mockContainerProps());

        expect(container.get(CORE.mainGate)).toBe(mainProvider.gate);
    });

    it("bind itemCount to computed value", () => {
        const [container] = createDatagridContainer(mockContainerProps());

        const itemsCount = container.get(CORE.atoms.itemCount);
        expect(itemsCount.get()).toBe(5);
    });

    it("reacts to datasource changes in itemCount", () => {
        const [container, , mainProvider] = createDatagridContainer(mockContainerProps());

        const itemsCount = container.get(CORE.atoms.itemCount);

        expect(itemsCount.get()).toBe(5);

        mainProvider.setProps({
            ...mockContainerProps(),
            datasource: list(10)
        });

        expect(itemsCount.get()).toBe(10);
    });

    it("bind dg config to the container", () => {
        const props = mockContainerProps();
        const [container] = createDatagridContainer(props);

        const config = container.get(CORE.config);
        expect(config).toBeDefined();
        expect(config).toMatchObject({
            name: "datagrid2_1",
            refreshIntervalMs: 0,
            selectionEnabled: false
        });
    });
});
