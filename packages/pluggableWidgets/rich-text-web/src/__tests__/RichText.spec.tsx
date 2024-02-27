import { EditableValueBuilder } from "@mendix/widget-plugin-test-utils";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { createElement } from "react";
import { RichTextContainerProps } from "../../typings/RichTextProps";

Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
    }))
});

import RichText from "../RichText";

describe("Rich Text", () => {
    let defaultProps: RichTextContainerProps;
    beforeEach(() => {
        defaultProps = {
            name: "RichText",
            id: "RichText1",
            stringAttribute: new EditableValueBuilder<string>().withValue("Rich text default value").build(),
            menubarMode: "basic",
            enableStatusBar: true,
            preset: "basic",
            toolbarMode: "sliding",
            toolbarLocation: "bottom",
            widthUnit: "percentage",
            width: 100,
            heightUnit: "percentageOfWidth",
            height: 75,
            spellCheck: false,
            highlight_on_focus: false,
            resize: "false",
            toolbarConfig: "basic",
            basicstyle: true,
            extendedstyle: true,
            textalign: true,
            clipboard: true,
            fontstyle: true,
            paragraph: true,
            document: true,
            history: true,
            accordion: true,
            code: true,
            anchor: true,
            direction: true,
            link: true,
            list: true,
            preview: true,
            table: true,
            visualaid: true,
            media: true,
            util: true,
            emoticon: true,
            remove: true,
            advancedConfig: [],
            menubarConfig: "basic",
            fileMenubar: true,
            editMenubar: true,
            insertMenubar: true,
            viewMenubar: true,
            formatMenubar: true,
            tableMenubar: true,
            toolsMenubar: true,
            helpMenubar: true,
            advancedMenubarConfig: []
        };
    });

    it("renders richtext widget", () => {
        const component = render(<RichText {...defaultProps} />);
        expect(component.container).toMatchSnapshot();
    });
});
