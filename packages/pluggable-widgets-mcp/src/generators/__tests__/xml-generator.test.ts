import { describe, expect, it } from "vitest";
import type { WidgetDefinition } from "@/generators/types";
import { generateWidgetXml, validateWidgetDefinition } from "@/generators/xml-generator";

function definition(overrides: Partial<WidgetDefinition> = {}): WidgetDefinition {
    return {
        name: "MyWidget",
        description: "a widget",
        properties: [{ key: "label", type: "string", caption: "Label" }],
        systemProperties: ["Name", "TabIndex", "Visibility"],
        ...overrides
    };
}

function xmlFor(overrides: Partial<WidgetDefinition> = {}): string {
    const result = generateWidgetXml(definition(overrides));
    expect(result.success).toBe(true);
    return result.xml!;
}

describe("generateWidgetXml", () => {
    it("emits a widget id namespaced by organization and name", () => {
        expect(xmlFor()).toContain('<widget id="mendix.mywidget.MyWidget"');
        expect(xmlFor()).toContain("<name>MyWidget</name>");
        expect(xmlFor()).toContain("<description>a widget</description>");
    });

    it("renders each property with its key, type and caption", () => {
        const xml = xmlFor({
            properties: [
                { key: "label", type: "string", caption: "Label", description: "Help text" },
                { key: "onClick", type: "action", caption: "On Click" }
            ]
        });
        expect(xml).toContain('<property key="label" type="string">');
        expect(xml).toContain("<caption>Label</caption>");
        expect(xml).toContain("<description>Help text</description>");
        expect(xml).toContain('<property key="onClick" type="action">');
    });

    it("groups non-action properties under General and actions under Events by default", () => {
        const xml = xmlFor({
            properties: [
                { key: "label", type: "string", caption: "Label" },
                { key: "onClick", type: "action", caption: "On Click" }
            ]
        });
        expect(xml.indexOf('propertyGroup caption="General"')).toBeGreaterThan(-1);
        expect(xml.indexOf('propertyGroup caption="Events"')).toBeGreaterThan(
            xml.indexOf('propertyGroup caption="General"')
        );
    });

    it("honours explicit property groups", () => {
        const xml = xmlFor({
            properties: [
                { key: "label", type: "string", caption: "Label" },
                { key: "size", type: "integer", caption: "Size" }
            ],
            propertyGroups: [{ caption: "Appearance", properties: ["label", "size"] }]
        });
        expect(xml).toContain('propertyGroup caption="Appearance"');
        expect(xml).not.toContain('propertyGroup caption="General"');
    });

    it("emits attributeTypes for attribute properties", () => {
        const xml = xmlFor({
            properties: [{ key: "value", type: "attribute", caption: "Value", attributeTypes: ["Integer", "Decimal"] }]
        });
        expect(xml).toContain('<attributeType name="Integer"');
        expect(xml).toContain('<attributeType name="Decimal"');
    });

    it("emits enumerationValues for enumeration properties", () => {
        const xml = xmlFor({
            properties: [
                {
                    key: "mode",
                    type: "enumeration",
                    caption: "Mode",
                    defaultValue: "light",
                    enumValues: [
                        { key: "light", caption: "Light" },
                        { key: "dark", caption: "Dark" }
                    ]
                }
            ]
        });
        expect(xml).toContain('<enumerationValue key="light">Light</enumerationValue>');
        expect(xml).toContain('<enumerationValue key="dark">Dark</enumerationValue>');
    });

    it("escapes XML metacharacters in captions", () => {
        const xml = xmlFor({
            properties: [{ key: "label", type: "string", caption: 'Fish & <Chips> "x"' }]
        });
        expect(xml).toContain("Fish &amp; &lt;Chips&gt;");
        expect(xml).not.toContain("<Chips>");
    });

    it("emits requested system properties and omits the rest", () => {
        const xml = xmlFor({ systemProperties: ["Name"] });
        expect(xml).toContain('<systemProperty key="Name" />');
        expect(xml).not.toContain('<systemProperty key="Visibility" />');
    });

    it("emits no systemProperty entries when given an empty list", () => {
        expect(xmlFor({ systemProperties: [] })).not.toContain("<systemProperty");
    });

    it("nests widgets properties with their datasource reference", () => {
        const xml = xmlFor({
            properties: [
                { key: "items", type: "datasource", caption: "Items", isList: true },
                { key: "content", type: "widgets", caption: "Content", dataSource: "items" }
            ]
        });
        expect(xml).toContain('<property key="items" type="datasource" isList="true">');
        expect(xml).toContain('dataSource="items"');
    });
});

describe("validateWidgetDefinition", () => {
    it("accepts a well-formed definition", () => {
        expect(validateWidgetDefinition(definition())).toEqual([]);
    });

    it("requires a PascalCase widget name", () => {
        expect(validateWidgetDefinition(definition({ name: "myWidget" })).join()).toContain("PascalCase");
    });

    it("requires at least one property", () => {
        expect(validateWidgetDefinition(definition({ properties: [] })).join()).toContain("at least one property");
    });

    it("requires camelCase property keys", () => {
        const errors = validateWidgetDefinition(
            definition({ properties: [{ key: "Label", type: "string", caption: "Label" }] })
        );
        expect(errors.join()).toContain("camelCase");
    });

    it("rejects duplicate property keys", () => {
        const errors = validateWidgetDefinition(
            definition({
                properties: [
                    { key: "value", type: "string", caption: "One" },
                    { key: "value", type: "string", caption: "Two" }
                ]
            })
        );
        expect(errors.join()).toContain("Duplicate property key");
    });

    it("requires attributeTypes on attribute properties", () => {
        const errors = validateWidgetDefinition(
            definition({ properties: [{ key: "value", type: "attribute", caption: "Value" }] })
        );
        expect(errors.join()).toContain("attributeTypes");
    });

    it("requires enumValues on enumeration properties", () => {
        const errors = validateWidgetDefinition(
            definition({ properties: [{ key: "mode", type: "enumeration", caption: "Mode" }] })
        );
        expect(errors.join()).toContain("enumValues");
    });

    it("rejects property groups referencing unknown keys", () => {
        const errors = validateWidgetDefinition(
            definition({ propertyGroups: [{ caption: "Appearance", properties: ["nope"] }] })
        );
        expect(errors.join()).toContain("unknown property key");
    });
});
