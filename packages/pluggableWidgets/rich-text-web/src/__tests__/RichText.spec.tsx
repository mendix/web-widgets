import { EditableValueBuilder } from "@mendix/widget-plugin-test-utils";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { createElement } from "react";
import { RichTextContainerProps } from "../../typings/RichTextProps";

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
            minHeight: 75,
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
            advancedConfig: [],
            readOnlyStyle: "text",
            tabIndex: 0,
            onChangeType: "onLeave",
            sandboxIframes: true,
            useRelativeUrl: false
        };
    });

    it("renders richtext widget", () => {
        const component = render(<RichText {...defaultProps} />);
        expect(component.container).toMatchSnapshot();
    });
});
