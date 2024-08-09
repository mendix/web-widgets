import { EditableValueBuilder } from "@mendix/widget-plugin-test-utils";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { createElement } from "react";
import { MarkdownContainerProps } from "typings/MarkdownProps";
import Markdown from "../Markdown";

describe("Markdown widget", () => {
    let defaultProps: MarkdownContainerProps;
    beforeEach(() => {
        defaultProps = {
            name: "Markdown1",
            id: "Markdown1",
            stringAttribute: new EditableValueBuilder<string>().withValue("Markdown viewer default value").build()
        };
    });

    it("renders markdown widget", () => {
        const component = render(<Markdown {...defaultProps} />);
        const markdownElement = component.container.querySelector(".widget-markdown");
        expect(markdownElement).toBeInTheDocument();
        expect(component.container).toMatchSnapshot();
    });

    it("does not render markdown widget when stringAttribute is unavailable", () => {
        defaultProps.stringAttribute = new EditableValueBuilder<string>().isUnavailable().build();
        const component = render(<Markdown {...defaultProps} />);
        const progressElement = component.container.querySelector(".mx-progress");
        expect(progressElement).toBeInTheDocument();
        expect(component.container).toMatchSnapshot();
    });
});
