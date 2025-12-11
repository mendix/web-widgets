import { mockContainerProps } from "../../../utils/test-utils";
import { datagridConfig } from "../Datagrid.config";

describe("datagridConfig", () => {
    it("should generate config with default values", () => {
        const props = mockContainerProps();
        const config = datagridConfig(props);

        expect(config).toMatchObject({
            checkboxColumnEnabled: false,
            columnsDraggable: true,
            columnsFilterable: true,
            columnsHidable: true,
            columnsResizable: true,
            columnsSortable: true,
            enableSelectAll: false,
            filtersChannelName: expect.stringMatching(/^datagrid2_1:Datagrid@\w+:events$/),
            id: expect.stringMatching(/^datagrid2_1:Datagrid@\w+$/),
            keepSelection: false,
            loadingType: "spinner",
            multiselectable: undefined,
            name: "datagrid2_1",
            refreshIntervalMs: 0,
            selectAllCheckboxEnabled: true,
            selectionEnabled: false,
            selectorColumnEnabled: true,
            settingsStorageEnabled: false
        });
    });

    it("should generate config with multi-selection enabled", () => {
        const props = {
            ...mockContainerProps(),
            itemSelection: { type: "Multi" } as any,
            itemSelectionMethod: "checkbox" as const,
            enableSelectAll: true,
            keepSelection: true,
            refreshInterval: 5
        };
        const config = datagridConfig(props);

        expect(config).toMatchObject({
            checkboxColumnEnabled: true,
            enableSelectAll: true,
            keepSelection: true,
            multiselectable: true,
            refreshIntervalMs: 5000,
            selectionEnabled: true
        });
    });

    it("should enable settings storage with localStorage", () => {
        const props = {
            ...mockContainerProps(),
            configurationStorageType: "localStorage" as const
        };
        const config = datagridConfig(props);

        expect(config.settingsStorageEnabled).toBe(true);
    });

    it("should enable settings storage with attribute when configurationAttribute is provided", () => {
        const props = {
            ...mockContainerProps(),
            configurationStorageType: "attribute" as const,
            configurationAttribute: { type: "attribute" } as any
        };
        const config = datagridConfig(props);

        expect(config.settingsStorageEnabled).toBe(true);
    });

    it("should disable settings storage with attribute when configurationAttribute is not provided", () => {
        const props = {
            ...mockContainerProps(),
            configurationStorageType: "attribute" as const,
            configurationAttribute: undefined
        };
        const config = datagridConfig(props);

        expect(config.settingsStorageEnabled).toBe(false);
    });
});
