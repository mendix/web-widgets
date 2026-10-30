import "@testing-library/jest-dom";
import { act, render } from "@testing-library/react";
import { Editor } from "@tiptap/core";
import { DynamicValue } from "mendix";
import { dynamic, EditableValueBuilder } from "@mendix/widget-plugin-test-utils";
import { RichTextContainerProps, StatusBarContentEnum } from "../../typings/RichTextProps";
import RichText from "../RichText";

const plainValue = `<p>Plain text</p>`;

describe("Rich Text default font family and size", () => {
    let defaultProps: RichTextContainerProps;

    beforeEach(() => {
        defaultProps = {
            name: "RichText",
            id: "RichText1",
            stringAttribute: new EditableValueBuilder<string>().withValue(plainValue).build(),
            // The font family / size dropdowns live in the "fontColor" group (preset "standard" and up).
            preset: "standard",
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
            tableBetter: false,
            helpButton: true,
            advancedConfig: [],
            readOnlyStyle: "text",
            tabIndex: 0,
            onChangeType: "onLeave",
            enableStatusBar: false,
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
            styleDataFormat: "class"
        };
    });

    function renderWidget(props: Partial<RichTextContainerProps> = {}): ReturnType<typeof render> {
        return render(<RichText {...defaultProps} {...props} />);
    }

    function fontFamilyLabel(container: HTMLElement): string | null | undefined {
        return container.querySelector(".toolbar-dropdown-button.fontFamily .dropdown-label")?.textContent;
    }

    function fontSizeLabel(container: HTMLElement): string | null | undefined {
        return container.querySelector(".toolbar-dropdown-button.fontSize .dropdown-label")?.textContent;
    }

    function getEditor(container: HTMLElement): Editor {
        return (container.querySelector(".ProseMirror") as HTMLElement & { editor: Editor }).editor;
    }

    describe("font family dropdown", () => {
        it("shows the placeholder when no default is configured", () => {
            const { container } = renderWidget();
            expect(fontFamilyLabel(container)).toBe("Font Family");
        });

        it("shows the configured default when the selection has no font family", () => {
            const { container } = renderWidget({ defaultFontFamily: dynamic.available("arial") });
            expect(fontFamilyLabel(container)).toBe("Arial");
        });

        it("matches the configured default by font name", () => {
            const { container } = renderWidget({ defaultFontFamily: dynamic.available("Times New Roman") });
            expect(fontFamilyLabel(container)).toBe("Times New Roman");
        });

        it("matches a custom font configured as default", () => {
            const { container } = renderWidget({
                customFonts: [{ fontName: "Roboto", fontStyle: "roboto, sans-serif" }],
                defaultFontFamily: dynamic.available("Roboto")
            });
            expect(fontFamilyLabel(container)).toBe("Roboto");
        });

        it("shows the font family of the selection when it has one", () => {
            const { container } = renderWidget({
                stringAttribute: new EditableValueBuilder<string>()
                    .withValue(`<p><span style="font-family: impact, sans-serif">Styled</span></p>`)
                    .build(),
                styleDataFormat: "inline",
                defaultFontFamily: dynamic.available("arial")
            });
            expect(fontFamilyLabel(container)).toBe("Impact");
        });

        it.each<[string, DynamicValue<string>]>([
            ["loading", dynamic.loading("arial")],
            ["unavailable", dynamic.unavailable()],
            ["empty", dynamic.available("")],
            ["unknown", dynamic.available("no-such-font")],
            ["unsafe", dynamic.available("arial; color: red")]
        ])("shows the placeholder when the default is %s", (_, value) => {
            const { container } = renderWidget({ defaultFontFamily: value });
            expect(fontFamilyLabel(container)).toBe("Font Family");
        });

        it("follows changes of the configured default", () => {
            const { container, rerender } = renderWidget({ defaultFontFamily: dynamic.available("arial") });
            rerender(<RichText {...defaultProps} defaultFontFamily={dynamic.available("impact")} />);
            expect(fontFamilyLabel(container)).toBe("Impact");
        });
    });

    describe("font size dropdown", () => {
        it("keeps the current fallback when no default is configured", () => {
            const { container } = renderWidget();
            expect(fontSizeLabel(container)).toBe("14px");
        });

        it("shows the configured default when the selection has no font size", () => {
            const { container } = renderWidget({ defaultFontSize: dynamic.available("20px") });
            expect(fontSizeLabel(container)).toBe("20px");
        });

        it("normalizes a bare number to px", () => {
            const { container } = renderWidget({ defaultFontSize: dynamic.available("24") });
            expect(fontSizeLabel(container)).toBe("24px");
        });

        it("shows the font size of the selection when it has one", () => {
            const { container } = renderWidget({
                stringAttribute: new EditableValueBuilder<string>()
                    .withValue(`<p><span style="font-size: 32px">Styled</span></p>`)
                    .build(),
                styleDataFormat: "inline",
                defaultFontSize: dynamic.available("20px")
            });
            expect(fontSizeLabel(container)).toBe("32px");
        });

        it.each<[string, DynamicValue<string>]>([
            ["loading", dynamic.loading("20px")],
            ["unavailable", dynamic.unavailable()],
            ["empty", dynamic.available("")],
            ["unsafe", dynamic.available("20px; color: red")]
        ])("keeps the current fallback when the default is %s", (_, value) => {
            const { container } = renderWidget({ defaultFontSize: value });
            expect(fontSizeLabel(container)).toBe("14px");
        });
    });

    describe("editor content", () => {
        beforeEach(() => jest.useFakeTimers());
        afterEach(() => jest.useRealTimers());

        function renderAndFlush(props: Partial<RichTextContainerProps>): {
            container: HTMLElement;
            stringAttribute: RichTextContainerProps["stringAttribute"];
        } {
            const stringAttribute = new EditableValueBuilder<string>().withValue(plainValue).build();
            const { container } = renderWidget({ stringAttribute, ...props });
            act(() => {
                jest.advanceTimersByTime(500);
            });
            return { container, stringAttribute };
        }

        it("does not style the editor or change the saved value", () => {
            const baseline = renderAndFlush({});
            const baselineHtml = getEditor(baseline.container).getHTML();
            baseline.container.remove();

            const setAttribute = jest.spyOn(Element.prototype, "setAttribute");
            const { container, stringAttribute } = renderAndFlush({
                defaultFontFamily: dynamic.available("arial"),
                defaultFontSize: dynamic.available("20px")
            });

            const dom = container.querySelector(".ProseMirror") as HTMLElement;
            expect(dom.style.fontFamily).toBe("");
            expect(dom.style.fontSize).toBe("");
            expect(setAttribute.mock.calls.some(([name, value]) => name === "style" && /font/i.test(value))).toBe(
                false
            );
            expect(getEditor(container).getHTML()).toBe(baselineHtml);
            expect(stringAttribute.setValue).not.toHaveBeenCalled();

            setAttribute.mockRestore();
        });
    });
});
