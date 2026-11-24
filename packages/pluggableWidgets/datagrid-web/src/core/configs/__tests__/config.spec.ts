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

    describe("isInteractive", () => {
        it("should be true when selection method is rowClick", () => {
            const props = {
                ...mockContainerProps(),
                itemSelection: { type: "Single" } as any,
                itemSelectionMethod: "rowClick" as const
            };
            const config = datagridConfig(props);

            expect(config.isInteractive).toBe(true);
        });

        it("should be true when onClick action is defined", () => {
            const props = {
                ...mockContainerProps(),
                onClick: { canExecute: true, execute: () => {} } as any
            };
            const config = datagridConfig(props);

            expect(config.isInteractive).toBe(true);
        });

        it("should be true when both rowClick and onClick are present", () => {
            const props = {
                ...mockContainerProps(),
                itemSelection: { type: "Single" } as any,
                itemSelectionMethod: "rowClick" as const,
                onClick: { canExecute: true, execute: () => {} } as any
            };
            const config = datagridConfig(props);

            expect(config.isInteractive).toBe(true);
        });

        it("should be false when selection method is checkbox", () => {
            const props = {
                ...mockContainerProps(),
                itemSelection: { type: "Multi" } as any,
                itemSelectionMethod: "checkbox" as const
            };
            const config = datagridConfig(props);

            expect(config.isInteractive).toBe(false);
        });

        it("should be false when no selection and no onClick", () => {
            const props = mockContainerProps();
            const config = datagridConfig(props);

            expect(config.isInteractive).toBe(false);
        });
    });

    describe("multiselectable", () => {
        it("should be true for Multi selection type", () => {
            const props = {
                ...mockContainerProps(),
                itemSelection: { type: "Multi" } as any,
                itemSelectionMethod: "checkbox" as const
            };
            const config = datagridConfig(props);

            expect(config.multiselectable).toBe(true);
        });

        it("should be undefined for Single selection type", () => {
            const props = {
                ...mockContainerProps(),
                itemSelection: { type: "Single" } as any,
                itemSelectionMethod: "rowClick" as const
            };
            const config = datagridConfig(props);

            expect(config.multiselectable).toBeUndefined();
        });

        it("should be undefined when no selection", () => {
            const props = mockContainerProps();
            const config = datagridConfig(props);

            expect(config.multiselectable).toBeUndefined();
        });
    });

    describe("checkboxColumnEnabled", () => {
        it("should be true for checkbox selection method", () => {
            const props = {
                ...mockContainerProps(),
                itemSelection: { type: "Multi" } as any,
                itemSelectionMethod: "checkbox" as const
            };
            const config = datagridConfig(props);

            expect(config.checkboxColumnEnabled).toBe(true);
        });

        it("should be false for rowClick selection method", () => {
            const props = {
                ...mockContainerProps(),
                itemSelection: { type: "Single" } as any,
                itemSelectionMethod: "rowClick" as const
            };
            const config = datagridConfig(props);

            expect(config.checkboxColumnEnabled).toBe(false);
        });

        it("should be false when no selection", () => {
            const props = mockContainerProps();
            const config = datagridConfig(props);

            expect(config.checkboxColumnEnabled).toBe(false);
        });
    });

    describe("selectionType and selectionMethod", () => {
        it("should map Single selection type correctly", () => {
            const props = {
                ...mockContainerProps(),
                itemSelection: { type: "Single" } as any,
                itemSelectionMethod: "rowClick" as const
            };
            const config = datagridConfig(props);

            expect(config.selectionType).toBe("Single");
            expect(config.selectionMethod).toBe("rowClick");
            expect(config.selectionEnabled).toBe(true);
        });

        it("should map Multi selection type correctly", () => {
            const props = {
                ...mockContainerProps(),
                itemSelection: { type: "Multi" } as any,
                itemSelectionMethod: "checkbox" as const
            };
            const config = datagridConfig(props);

            expect(config.selectionType).toBe("Multi");
            expect(config.selectionMethod).toBe("checkbox");
            expect(config.selectionEnabled).toBe(true);
        });

        it("should return None when no selection", () => {
            const props = mockContainerProps();
            const config = datagridConfig(props);

            expect(config.selectionType).toBe("None");
            expect(config.selectionMethod).toBe("none");
            expect(config.selectionEnabled).toBe(false);
        });
    });

    describe("config immutability", () => {
        it("should return a frozen config object", () => {
            const props = mockContainerProps();
            const config = datagridConfig(props);

            expect(Object.isFrozen(config)).toBe(true);
        });

        it("should not allow modification of config properties", () => {
            const props = mockContainerProps();
            const config = datagridConfig(props);

            expect(() => {
                (config as any).name = "modified";
            }).toThrow();
        });
    });

    describe("refresh interval calculation", () => {
        it("should convert seconds to milliseconds", () => {
            const props = {
                ...mockContainerProps(),
                refreshInterval: 10
            };
            const config = datagridConfig(props);

            expect(config.refreshIntervalMs).toBe(10000);
        });

        it("should handle zero refresh interval", () => {
            const props = {
                ...mockContainerProps(),
                refreshInterval: 0
            };
            const config = datagridConfig(props);

            expect(config.refreshIntervalMs).toBe(0);
        });
    });

    describe("column configuration flags", () => {
        it("should handle all column flags set to false", () => {
            const props = {
                ...mockContainerProps(),
                columnsDraggable: false,
                columnsFilterable: false,
                columnsHidable: false,
                columnsResizable: false,
                columnsSortable: false
            };
            const config = datagridConfig(props);

            expect(config.columnsDraggable).toBe(false);
            expect(config.columnsFilterable).toBe(false);
            expect(config.columnsHidable).toBe(false);
            expect(config.columnsResizable).toBe(false);
            expect(config.columnsSortable).toBe(false);
            expect(config.selectorColumnEnabled).toBe(false);
        });

        it("should map selectorColumnEnabled from columnsHidable", () => {
            const propsWithHidable = {
                ...mockContainerProps(),
                columnsHidable: true
            };
            const configWithHidable = datagridConfig(propsWithHidable);

            expect(configWithHidable.selectorColumnEnabled).toBe(true);

            const propsWithoutHidable = {
                ...mockContainerProps(),
                columnsHidable: false
            };
            const configWithoutHidable = datagridConfig(propsWithoutHidable);

            expect(configWithoutHidable.selectorColumnEnabled).toBe(false);
        });
    });

    describe("selectionMode mapping", () => {
        it("should map itemSelectionMode from props", () => {
            const props = {
                ...mockContainerProps(),
                itemSelection: { type: "Multi" } as any,
                itemSelectionMethod: "checkbox" as const,
                itemSelectionMode: "click" as any
            };
            const config = datagridConfig(props);

            expect(config.selectionMode).toBe("click");
        });
    });

    describe("autoSelect flag", () => {
        it("should map autoSelect from props", () => {
            const propsWithAutoSelect = {
                ...mockContainerProps(),
                autoSelect: true
            };
            const configWithAutoSelect = datagridConfig(propsWithAutoSelect);

            expect(configWithAutoSelect.autoSelect).toBe(true);

            const propsWithoutAutoSelect = {
                ...mockContainerProps(),
                autoSelect: false
            };
            const configWithoutAutoSelect = datagridConfig(propsWithoutAutoSelect);

            expect(configWithoutAutoSelect.autoSelect).toBe(false);
        });
    });

    describe("edge cases and boundary values", () => {
        it("should handle very large refresh intervals", () => {
            const props = {
                ...mockContainerProps(),
                refreshInterval: 3600
            };
            const config = datagridConfig(props);

            expect(config.refreshIntervalMs).toBe(3600000);
        });

        it("should generate unique IDs for multiple config instances", () => {
            const props = mockContainerProps();
            const config1 = datagridConfig(props);
            const config2 = datagridConfig(props);

            expect(config1.id).not.toBe(config2.id);
            expect(config1.filtersChannelName).not.toBe(config2.filtersChannelName);
        });

        it("should maintain consistent ID format with widget name", () => {
            const props = {
                ...mockContainerProps(),
                name: "customDatagrid"
            };
            const config = datagridConfig(props);

            expect(config.id).toMatch(/^customDatagrid:Datagrid@[\w-]+$/);
            expect(config.filtersChannelName).toMatch(/^customDatagrid:Datagrid@[\w-]+:events$/);
            expect(config.name).toBe("customDatagrid");
        });
    });

    describe("complex multi-feature scenarios", () => {
        it("should handle all selection features enabled simultaneously", () => {
            const props = {
                ...mockContainerProps(),
                itemSelection: { type: "Multi" } as any,
                itemSelectionMethod: "checkbox" as const,
                enableSelectAll: true,
                keepSelection: true,
                autoSelect: true,
                showSelectAllToggle: true
            };
            const config = datagridConfig(props);

            expect(config.selectionEnabled).toBe(true);
            expect(config.selectionType).toBe("Multi");
            expect(config.selectionMethod).toBe("checkbox");
            expect(config.checkboxColumnEnabled).toBe(true);
            expect(config.enableSelectAll).toBe(true);
            expect(config.keepSelection).toBe(true);
            expect(config.autoSelect).toBe(true);
            expect(config.selectAllCheckboxEnabled).toBe(true);
            expect(config.multiselectable).toBe(true);
            expect(config.isInteractive).toBe(false);
        });

        it("should handle single selection with rowClick and all features", () => {
            const props = {
                ...mockContainerProps(),
                itemSelection: { type: "Single" } as any,
                itemSelectionMethod: "rowClick" as const,
                onClick: { canExecute: true, execute: () => {} } as any,
                enableSelectAll: false,
                keepSelection: false,
                autoSelect: false
            };
            const config = datagridConfig(props);

            expect(config.selectionEnabled).toBe(true);
            expect(config.selectionType).toBe("Single");
            expect(config.selectionMethod).toBe("rowClick");
            expect(config.checkboxColumnEnabled).toBe(false);
            expect(config.enableSelectAll).toBe(false);
            expect(config.keepSelection).toBe(false);
            expect(config.autoSelect).toBe(false);
            expect(config.multiselectable).toBeUndefined();
            expect(config.isInteractive).toBe(true);
        });

        it("should handle fully disabled datagrid (no interactions, no columns features)", () => {
            const props = {
                ...mockContainerProps(),
                columnsDraggable: false,
                columnsFilterable: false,
                columnsHidable: false,
                columnsResizable: false,
                columnsSortable: false,
                itemSelection: undefined,
                onClick: undefined,
                enableSelectAll: false,
                keepSelection: false,
                autoSelect: false,
                refreshInterval: 0
            };
            const config = datagridConfig(props);

            expect(config.isInteractive).toBe(false);
            expect(config.selectionEnabled).toBe(false);
            expect(config.checkboxColumnEnabled).toBe(false);
            expect(config.columnsDraggable).toBe(false);
            expect(config.columnsFilterable).toBe(false);
            expect(config.columnsHidable).toBe(false);
            expect(config.columnsResizable).toBe(false);
            expect(config.columnsSortable).toBe(false);
            expect(config.selectorColumnEnabled).toBe(false);
            expect(config.enableSelectAll).toBe(false);
            expect(config.keepSelection).toBe(false);
            expect(config.autoSelect).toBe(false);
            expect(config.refreshIntervalMs).toBe(0);
        });
    });
});
