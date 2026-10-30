import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { EditableValueBuilder } from "@mendix/widget-plugin-test-utils";
import { RichTextContainerProps, StatusBarContentEnum } from "../../typings/RichTextProps";
import RichText from "../RichText";

describe("Rich Text spell checking", () => {
    let defaultProps: RichTextContainerProps;
    beforeEach(() => {
        defaultProps = {
            name: "RichText",
            id: "RichText1",
            stringAttribute: new EditableValueBuilder<string>().withValue("<p>Rich text</p>").build(),
            preset: "basic",
            toolbarLocation: "bottom",
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
            spellCheck: false,
            minHeightUnit: "none",
            maxHeightUnit: "none",
            maxHeight: 0,
            minHeight: 75,
            OverflowY: "auto",
            customFonts: [],
            enableDefaultUpload: true,
            linkValidation: true,
            styleDataFormat: "inline"
        };
    });

    const getEditable = (container: HTMLElement): HTMLElement => {
        const editable = container.querySelector<HTMLElement>(".ProseMirror");
        expect(editable).not.toBeNull();
        return editable!;
    };

    it("enables spell checking on the editable area when spellCheck is true", () => {
        const { container } = render(<RichText {...defaultProps} spellCheck />);
        expect(getEditable(container)).toHaveAttribute("spellcheck", "true");
    });

    it("disables spell checking on the editable area when spellCheck is false", () => {
        const { container } = render(<RichText {...defaultProps} spellCheck={false} />);
        expect(getEditable(container)).toHaveAttribute("spellcheck", "false");
    });

    it("follows spellCheck changes after the editor is created", () => {
        const { container, rerender } = render(<RichText {...defaultProps} spellCheck={false} />);
        expect(getEditable(container)).toHaveAttribute("spellcheck", "false");

        rerender(<RichText {...defaultProps} spellCheck />);
        expect(getEditable(container)).toHaveAttribute("spellcheck", "true");
    });
});
