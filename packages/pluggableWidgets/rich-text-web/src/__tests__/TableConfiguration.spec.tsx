import "@testing-library/jest-dom";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { Editor as CoreEditor } from "@tiptap/core";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { EditableValueBuilder } from "@mendix/widget-plugin-test-utils";
import { RichTextContainerProps, StatusBarContentEnum, StyleDataFormatEnum } from "../../typings/RichTextProps";
import RichText from "../RichText";

function buildProps(overrides: Partial<RichTextContainerProps> = {}): RichTextContainerProps {
    return {
        name: "RichText",
        id: "RichText1",
        stringAttribute: new EditableValueBuilder<string>().withValue("<p>text</p>").build(),
        preset: "full",
        toolbarLocation: "top",
        widthUnit: "percentage",
        width: 100,
        heightUnit: "percentageOfWidth",
        height: 75,
        toolbarConfig: "basic",
        history: true,
        fontStyle: true,
        fontScript: true,
        fontColor: true,
        code: true,
        indent: true,
        embed: true,
        align: true,
        list: true,
        remove: true,
        header: true,
        view: true,
        tableBetter: true,
        helpButton: true,
        advancedConfig: [],
        readOnlyStyle: "text",
        tabIndex: 0,
        onChangeType: "onLeave",
        enableStatusBar: true,
        dialogStyle: "inline",
        statusBarContent: "wordCount" as StatusBarContentEnum,
        spellCheck: true,
        minHeightUnit: "none",
        maxHeightUnit: "none",
        maxHeight: 0,
        minHeight: 75,
        OverflowY: "auto",
        customFonts: [],
        enableDefaultUpload: true,
        linkValidation: true,
        styleDataFormat: "inline",
        ...overrides
    };
}

type EditorDom = HTMLElement & { editor: CoreEditor };

function findNode(editor: CoreEditor, typeName: string): ProseMirrorNode {
    let found: ProseMirrorNode | undefined;
    editor.state.doc.descendants(node => {
        if (!found && node.type.name === typeName) {
            found = node;
        }
        return !found;
    });
    if (!found) {
        throw new Error(`No ${typeName} node in the document`);
    }
    return found;
}

// Renders the full widget, inserts a table with the caret in its first cell and opens the
// given configuration menu from the toolbar, as a user would.
function openConfigurationMenu(
    styleDataFormat: StyleDataFormatEnum,
    title: string
): { editor: CoreEditor; sections: HTMLElement[] } {
    const { container } = render(<RichText {...buildProps({ styleDataFormat })} />);
    const editor = (container.querySelector(".ProseMirror") as EditorDom).editor;

    act(() => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: false }).run();
    });
    expect(editor.isActive("table")).toBe(true);

    fireEvent.click(screen.getByTitle(title));
    const dropdown = container.querySelector(".configuration-dropdown") as HTMLElement;
    expect(dropdown).not.toBeNull();
    const sections = Array.from(dropdown.querySelectorAll<HTMLElement>(".configuration-section"));
    return { editor, sections };
}

// The hex input of a Compact color picker shows its current color (without "#")
function pickerHex(section: HTMLElement): string {
    return (section.querySelector(".w-color-compact input") as HTMLInputElement).value;
}

describe("Table configuration menu", () => {
    it.each(["inline", "class"] as StyleDataFormatEnum[])(
        "keeps applying and showing every change while it stays open (%s)",
        styleDataFormat => {
            const { editor, sections } = openConfigurationMenu(styleDataFormat, "Table Configuration");
            const [background, borderColor, borderStyle, borderWidth] = sections;
            const borderStyleSelect = borderStyle.querySelector("select") as HTMLSelectElement;
            const borderWidthSelect = borderWidth.querySelector("select") as HTMLSelectElement;
            const table = (): Record<string, unknown> => findNode(editor, "table").attrs;

            fireEvent.click(within(background).getByTitle("#F44E3B"));
            expect(table().backgroundColor).toBe("#f44e3b");
            expect(pickerHex(background)).toBe("F44E3B");

            fireEvent.click(within(borderColor).getByTitle("#D33115"));
            expect(table().borderColor).toBe("#d33115");
            expect(pickerHex(borderColor)).toBe("D33115");

            fireEvent.click(within(borderColor).getByTitle("#000000"));
            expect(table().borderColor).toBe("#000000");
            expect(pickerHex(borderColor)).toBe("000000");

            fireEvent.change(borderStyleSelect, { target: { value: "solid" } });
            expect(table().borderStyle).toBe("solid");
            expect(borderStyleSelect).toHaveValue("solid");

            fireEvent.change(borderWidthSelect, { target: { value: "3px" } });
            expect(table().borderWidth).toBe("3px");
            expect(borderWidthSelect).toHaveValue("3px");

            fireEvent.change(borderWidthSelect, { target: { value: "5px" } });
            expect(table().borderWidth).toBe("5px");
            expect(borderWidthSelect).toHaveValue("5px");

            fireEvent.change(borderStyleSelect, { target: { value: "groove" } });
            expect(table().borderStyle).toBe("groove");
            expect(borderStyleSelect).toHaveValue("groove");

            fireEvent.click(within(borderColor).getByTitle("#0062B1"));
            expect(table().borderColor).toBe("#0062b1");
            expect(pickerHex(borderColor)).toBe("0062B1");

            // Every control still reflects the table after the whole sequence
            expect(pickerHex(background)).toBe("F44E3B");
            expect(borderStyleSelect).toHaveValue("groove");
            expect(borderWidthSelect).toHaveValue("5px");
        }
    );
});

describe("Cell configuration menu", () => {
    it("keeps applying and showing every change while it stays open", () => {
        const { editor, sections } = openConfigurationMenu("inline", "Cell Configuration");
        const [, borderColor, borderStyle] = sections;
        const borderStyleSelect = borderStyle.querySelector("select") as HTMLSelectElement;
        const cell = (): Record<string, unknown> => findNode(editor, "tableCell").attrs;

        fireEvent.change(borderStyleSelect, { target: { value: "solid" } });
        expect(cell().borderStyle).toBe("solid");
        expect(borderStyleSelect).toHaveValue("solid");

        fireEvent.change(borderStyleSelect, { target: { value: "groove" } });
        expect(cell().borderStyle).toBe("groove");
        expect(borderStyleSelect).toHaveValue("groove");

        fireEvent.click(within(borderColor).getByTitle("#0062B1"));
        expect(cell().borderColor).toBe("#0062b1");
        expect(pickerHex(borderColor)).toBe("0062B1");
    });
});
