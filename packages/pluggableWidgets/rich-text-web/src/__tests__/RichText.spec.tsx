import { EditableValueBuilder } from "@mendix/widget-plugin-test-utils";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { createElement } from "react";
import { RichTextContainerProps } from "../../typings/RichTextProps";

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
            advancedConfig: [],
            readOnlyStyle: "text",
            tabIndex: 0,
            onChangeType: "onLeave",
            enableStatusBar: true,
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
});
