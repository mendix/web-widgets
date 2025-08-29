import { EditableValueBuilder } from "@mendix/widget-plugin-test-utils";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { createElement } from "react";
import { RichTextContainerProps, StatusBarContentEnum } from "../../typings/RichTextProps";

import RichText from "../RichText";

describe("Rich Text", () => {
    let defaultProps: RichTextContainerProps;
    beforeEach(() => {
        defaultProps = {
            name: "RichText",
            id: "RichText1",
            stringAttribute: new EditableValueBuilder<string>().withValue("Rich text default value").build(),
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
            formOrientation: "vertical"
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

    it("renders with character count status bar", () => {
        const component = render(<RichText {...defaultProps} statusBarContent={"characterCount" as StatusBarContentEnum} />);
        expect(component.container).toMatchSnapshot();
    });

    it("renders with HTML character count status bar", () => {
        const component = render(<RichText {...defaultProps} statusBarContent={"characterCountHtml" as StatusBarContentEnum} />);
        expect(component.container).toMatchSnapshot();
    });

    it("renders with both word and character count", () => {
        const component = render(<RichText {...defaultProps} statusBarContent={"both" as StatusBarContentEnum} />);
        expect(component.container).toMatchSnapshot();
    });
});
