import { describe, expect, it } from "vitest";
import { generateEditorPreview } from "@/generators/tsx-generator";
import type { PropertyDefinition } from "@/generators/types";

/**
 * generateEditorPreview produces a Studio Pro design-mode preview component.
 *
 * Design rule: if any property can produce a meaningful value in PreviewProps,
 * use it — so `props` is always read and TS6133 never fires.
 *
 * Displayable types (produce readable primitives in PreviewProps):
 *   string, textTemplate, attribute   → string  → props.key || "[WidgetName]"
 *   integer, decimal                  → number  → props.key != null ? String(props.key) : "[WidgetName]"
 *   boolean                           → boolean → props.key != null ? String(props.key) : "[WidgetName]"
 *
 * Non-displayable types (action, enumeration, datasource, …) do not produce
 * a value worth showing in the preview, so they are skipped. If ALL properties
 * are non-displayable (or there are no properties), _props is used as the
 * conventional TypeScript signal for an intentionally unused parameter.
 */
describe("generateEditorPreview", () => {
    // ── string-like props (existing behaviour, must not regress) ────────────

    it("uses props and shows string value when a string property is present", () => {
        const properties: PropertyDefinition[] = [{ key: "title", type: "string", caption: "Title", required: false }];
        const output = generateEditorPreview("Card", properties);

        expect(output).toContain("preview(props: CardPreviewProps)");
        expect(output).toContain('props.title || "[Card]"');
        expect(output).not.toContain("_props");
    });

    it("uses props and shows textTemplate value when a textTemplate property is present", () => {
        const properties: PropertyDefinition[] = [
            { key: "text", type: "textTemplate", caption: "Text", required: true }
        ];
        const output = generateEditorPreview("Label", properties);

        expect(output).toContain("preview(props: LabelPreviewProps)");
        expect(output).toContain('props.text || "[Label]"');
        expect(output).not.toContain("_props");
    });

    it("uses props and shows attribute value when an attribute property is present", () => {
        const properties: PropertyDefinition[] = [
            { key: "value", type: "attribute", caption: "Value", required: true, attributeTypes: ["String"] }
        ];
        const output = generateEditorPreview("Input", properties);

        expect(output).toContain("preview(props: InputPreviewProps)");
        expect(output).toContain('props.value || "[Input]"');
        expect(output).not.toContain("_props");
    });

    // ── numeric props ────────────────────────────────────────────────────────

    it("uses props and shows integer value when an integer property is present", () => {
        const properties: PropertyDefinition[] = [
            { key: "initialValue", type: "integer", caption: "Initial value", required: false }
        ];
        const output = generateEditorPreview("Counter", properties);

        expect(output).toContain("preview(props: CounterPreviewProps)");
        expect(output).toContain('props.initialValue != null ? String(props.initialValue) : "[Counter]"');
        expect(output).not.toContain("_props");
    });

    it("uses props and shows decimal value when a decimal property is present", () => {
        const properties: PropertyDefinition[] = [
            { key: "amount", type: "decimal", caption: "Amount", required: false }
        ];
        const output = generateEditorPreview("Price", properties);

        expect(output).toContain("preview(props: PricePreviewProps)");
        expect(output).toContain('props.amount != null ? String(props.amount) : "[Price]"');
        expect(output).not.toContain("_props");
    });

    // ── boolean props ────────────────────────────────────────────────────────

    it("uses props and shows boolean value when a boolean property is present", () => {
        const properties: PropertyDefinition[] = [
            { key: "enabled", type: "boolean", caption: "Enabled", required: false }
        ];
        const output = generateEditorPreview("Toggle", properties);

        expect(output).toContain("preview(props: TogglePreviewProps)");
        expect(output).toContain('props.enabled != null ? String(props.enabled) : "[Toggle]"');
        expect(output).not.toContain("_props");
    });

    // ── first displayable prop wins ──────────────────────────────────────────

    it("uses the first displayable prop when multiple types are mixed", () => {
        const properties: PropertyDefinition[] = [
            { key: "onClick", type: "action", caption: "On click", required: false },
            { key: "count", type: "integer", caption: "Count", required: false },
            { key: "label", type: "string", caption: "Label", required: false }
        ];
        const output = generateEditorPreview("Widget", properties);

        // action is skipped, integer is first displayable
        expect(output).toContain('props.count != null ? String(props.count) : "[Widget]"');
        expect(output).not.toContain("_props");
    });

    // ── non-displayable only → _props ────────────────────────────────────────

    it("uses _props when all properties are non-displayable types (action, enumeration)", () => {
        const properties: PropertyDefinition[] = [
            { key: "onClick", type: "action", caption: "On click", required: false },
            {
                key: "size",
                type: "enumeration",
                caption: "Size",
                required: false,
                enumValues: [
                    { key: "small", caption: "Small" },
                    { key: "large", caption: "Large" }
                ]
            }
        ];
        const output = generateEditorPreview("Button", properties);

        expect(output).toContain("preview(_props: ButtonPreviewProps)");
        expect(output).toContain('"[Button]"');
        expect(output).not.toContain("preview(props: ButtonPreviewProps)");
    });

    it("uses _props when there are no properties at all", () => {
        const output = generateEditorPreview("Empty", []);

        expect(output).toContain("preview(_props: EmptyPreviewProps)");
        expect(output).toContain('"[Empty]"');
    });
});
