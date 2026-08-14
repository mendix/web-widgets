import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { EditableValueBuilder } from "@mendix/widget-plugin-test-utils";
import { RichTextContainerProps, StatusBarContentEnum } from "../../typings/RichTextProps";

import RichText from "../RichText";
const richTextDefaultValue = `<h2><strong>Rich text default value</strong></h2>`;
describe("Rich Text", () => {
    let defaultProps: RichTextContainerProps;
    beforeEach(() => {
        defaultProps = {
            name: "RichText",
            id: "RichText1",
            stringAttribute: new EditableValueBuilder<string>().withValue(richTextDefaultValue).build(),
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
            enableStatusBar: true,
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
            styleDataFormat: "inline"
        };
    });

    it("renders richtext widget", () => {
        const component = render(<RichText {...defaultProps} />);
        expect(component.container).toMatchSnapshot();
    });

    it("renders richtext widget with different config", () => {
        const component = render(<RichText {...defaultProps} toolbarLocation={"top"} preset={"full"} />);
        expect(component.container).toMatchSnapshot();
    });

    it("renders richtext widget with readonly config", async () => {
        const component = render(
            <RichText
                {...defaultProps}
                readOnlyStyle={"bordered"}
                stringAttribute={new EditableValueBuilder<string>()
                    .withValue(richTextDefaultValue)
                    .isReadOnly()
                    .build()}
            />
        );
        expect(component.container).toMatchSnapshot();
    });

    it("renders with character count status bar", () => {
        const component = render(
            <RichText {...defaultProps} statusBarContent={"characterCount" as StatusBarContentEnum} />
        );
        expect(component.container).toMatchSnapshot();
    });

    it("renders with HTML character count status bar", () => {
        const component = render(
            <RichText {...defaultProps} statusBarContent={"characterCountHtml" as StatusBarContentEnum} />
        );
        expect(component.container).toMatchSnapshot();
    });

    it("renders with both word and character count", () => {
        const component = render(<RichText {...defaultProps} statusBarContent={"both" as StatusBarContentEnum} />);
        expect(component.container).toMatchSnapshot();
    });

    describe("Empty content handling", () => {
        it("handles empty string value", () => {
            const emptyAttribute = new EditableValueBuilder<string>().withValue("").build();
            const component = render(<RichText {...defaultProps} stringAttribute={emptyAttribute} />);
            expect(component.container).toBeTruthy();
        });

        it("handles undefined value", () => {
            const undefinedAttribute = new EditableValueBuilder<string>().withValue(undefined).build();
            const component = render(<RichText {...defaultProps} stringAttribute={undefinedAttribute} />);
            expect(component.container).toBeTruthy();
        });

        it("handles <p></p> value", () => {
            const emptyParagraphAttribute = new EditableValueBuilder<string>().withValue("<p></p>").build();
            const component = render(<RichText {...defaultProps} stringAttribute={emptyParagraphAttribute} />);
            expect(component.container).toBeTruthy();
        });
    });
});
