import { shallow } from "enzyme";
import { IconButton, IconButtonProps } from "../components/IconButton";
import { createElement } from "react";
import * as classNames from "classnames";

describe("IconButton", () => {
    const renderIconButton = (props: IconButtonProps) => shallow(createElement(IconButton, props));

    it("should render element type 'i' by default", () => {
        const iconButton = renderIconButton({ glyphIcon: "info-o" });

        expect(iconButton.type()).toBeElement("i");
    });

    it("with type 'i' should render the structure correctly", () => {
        const iconButton = renderIconButton({ type: "i", glyphIcon: "info-o" });

        expect(iconButton).toBeElement(createElement("i", { className: classNames("glyphicon", "glyphicon-info-o") }));
    });

    it("with type 'span' should render the structure correctly", () => {
        const iconButton = renderIconButton({ type: "span", glyphIcon: "info-o" });

        expect(iconButton).toBeElement(
            createElement("span", { className: classNames("glyphicon", "glyphicon-info-o") })
        );
    });

    it("with type 'em' should render the structure correctly", () => {
        const iconButton = renderIconButton({ type: "em", glyphIcon: "info-o" });

        expect(iconButton).toBeElement(createElement("em", { className: classNames("glyphicon", "glyphicon-info-o") }));
    });

    it("should render with the specified glyhicon class", () => {
        const iconButton = renderIconButton({ type: "i", glyphIcon: "info-o" });

        expect(iconButton.hasClass("glyphicon-info-o")).toBe(true);

        iconButton.setProps({ glyphIcon: "car" });
        expect(iconButton.hasClass("glyphicon-car")).toBe(true);
    });

    it("should respond to onClick events", () => {
        const onClickSpy = jasmine.createSpy("onClick");
        const iconButton = renderIconButton({ type: "i", glyphIcon: "info-o", onClick: onClickSpy });

        iconButton.simulate("click");
        expect(onClickSpy).toHaveBeenCalled();
    });
});
