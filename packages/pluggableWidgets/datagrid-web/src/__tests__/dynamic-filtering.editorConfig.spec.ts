import { Properties } from "@mendix/pluggable-widgets-tools";
import { DatagridPreviewProps } from "../../typings/DatagridProps";
import { check, getProperties } from "../Datagrid.editorConfig";

const DYNAMIC_KEYS = [
    "filterFields",
    "filterFieldOptions",
    "addFilterCaption",
    "clearFiltersCaption",
    "removeFilterAriaLabel",
    "filterFieldAriaLabel"
];

const TOP_KEYS = ["filteringMode", "columnsFilterable", "filtersPlaceholder", "columns", ...DYNAMIC_KEYS];

function values(overrides: Partial<DatagridPreviewProps> = {}): DatagridPreviewProps {
    return {
        filteringMode: "fixed",
        columnsFilterable: true,
        columnsSortable: true,
        columnsResizable: true,
        columnsDraggable: true,
        columnsHidable: true,
        columns: [
            {
                showContentAs: "attribute",
                attribute: "Name",
                header: "Name",
                sortable: true,
                hidable: "no",
                width: "autoFill",
                minWidth: "auto",
                exportType: "default"
            }
        ],
        filterFields: [],
        filterFieldOptions: [],
        pagination: "buttons",
        useCustomPagination: false,
        showEmptyPlaceholder: "none",
        itemSelection: "None",
        itemSelectionMethod: "checkbox",
        configurationStorageType: "attribute",
        ...overrides
    } as unknown as DatagridPreviewProps;
}

function properties(): Properties {
    const prop = (key: string): { key: string; caption: string; description: string } => ({
        key,
        caption: key,
        description: ""
    });
    return [
        {
            caption: "All",
            propertyGroups: [
                {
                    caption: "Flat",
                    properties: TOP_KEYS.map(key =>
                        key === "columns"
                            ? {
                                  ...prop(key),
                                  objects: [{ properties: [{ caption: "Column", properties: [prop("filter")] }] }]
                              }
                            : prop(key)
                    )
                }
            ]
        }
    ] as unknown as Properties;
}

function visible(overrides: Partial<DatagridPreviewProps> = {}): { top: string[]; column: string[] } {
    const result = getProperties(values(overrides), properties());
    const props = result[0].propertyGroups![0].properties!;
    const columns = props.find(p => p.key === "columns");
    return {
        top: props.map(p => p.key),
        column: columns?.objects?.[0].properties[0].properties?.map(p => p.key) ?? []
    };
}

describe("dynamic filtering: Studio Pro visibility", () => {
    it("hides Dynamic filters properties and texts in Fixed mode", () => {
        const { top, column } = visible({ filteringMode: "fixed" });
        DYNAMIC_KEYS.forEach(key => expect(top).not.toContain(key));
        expect(top).toContain("columnsFilterable");
        expect(column).toContain("filter");
    });

    it("hides column filters in Dynamic mode and shows Dynamic filters properties", () => {
        const { top, column } = visible({ filteringMode: "dynamic" });
        DYNAMIC_KEYS.forEach(key => expect(top).toContain(key));
        expect(top).not.toContain("columnsFilterable");
        expect(column).not.toContain("filter");
    });

    it.each(["fixed", "dynamic"] as const)("never hides the filters placeholder (%s)", filteringMode => {
        expect(visible({ filteringMode }).top).toContain("filtersPlaceholder");
    });
});

describe("dynamic filtering: consistency checks", () => {
    const field = (key: string, label = key): DatagridPreviewProps["filterFields"][number] => ({
        key,
        label,
        attribute: "Attr"
    });
    const option = (fieldKey: string): DatagridPreviewProps["filterFieldOptions"][number] => ({
        fieldKey,
        caption: "Caption",
        value: "'value'"
    });
    const problems = (overrides: Partial<DatagridPreviewProps>): Array<{ property?: string }> =>
        check(values(overrides)).filter(p => p.property?.startsWith("filterField"));

    it("reports nothing for a valid configuration", () => {
        expect(
            problems({
                filteringMode: "dynamic",
                filterFields: [field("status"), field("name")],
                filterFieldOptions: [option("status")]
            })
        ).toEqual([]);
    });

    it("reports Dynamic mode without fields", () => {
        expect(problems({ filteringMode: "dynamic" })).toEqual([expect.objectContaining({ property: "filterFields" })]);
    });

    it("doesn't require fields in Fixed mode", () => {
        expect(problems({ filteringMode: "fixed" })).toEqual([]);
    });

    it("reports an empty key", () => {
        expect(problems({ filteringMode: "dynamic", filterFields: [field(" ", "Status")] })).toEqual([
            expect.objectContaining({ property: "filterFields/1/key" })
        ]);
    });

    it("reports a duplicate key on the second field", () => {
        expect(
            problems({ filteringMode: "dynamic", filterFields: [field("status"), field("name"), field("status")] })
        ).toEqual([expect.objectContaining({ property: "filterFields/3/key" })]);
    });

    it("reports an option whose field key matches no field", () => {
        expect(
            problems({
                filteringMode: "dynamic",
                filterFields: [field("status")],
                filterFieldOptions: [option("status"), option("priority")]
            })
        ).toEqual([expect.objectContaining({ property: "filterFieldOptions/2/fieldKey" })]);
    });
});
