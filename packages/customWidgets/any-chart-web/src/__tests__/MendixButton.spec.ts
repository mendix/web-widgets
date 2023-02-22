import { shallow } from "enzyme";
import { createElement } from "react";

import { IconButton } from "../components/IconButton";
import { MendixButton, MendixButtonProps } from "../components/MendixButton";

describe("MendixButton", () => {
    const renderMendixButton = (props: MendixButtonProps) => shallow(createElement(MendixButton, props));
    let defaultProps: MendixButtonProps;

    beforeEach(() => {
        defaultProps = { onClick: jasmine.createSpy("onClick") };
    });

    it("should render the structure correctly", () => {
        const mendixButton = renderMendixButton({ onClick: jasmine.createSpy("onClick") });

        expect(mendixButton).toBeElement(
            createElement("button", {
                className: "mx-button btn btn-default",
                onClick: jasmine.any(Function)
            })
        );
    });

    it("should be enabled by default", () => {
        const mendixButton = renderMendixButton({ onClick: jasmine.createSpy("onClick") });

        expect(mendixButton).not.toHaveClass("disabled");
    });

    it("should render with the correct class for the specified bootstrap style", () => {
        defaultProps.style = "primary";
        const mendixButton = renderMendixButton(defaultProps);

        expect(mendixButton).toHaveClass("btn-primary");

        mendixButton.setProps({ style: "danger" });
        expect(mendixButton).toHaveClass("btn-danger");

        mendixButton.setProps({ style: "success" });
        expect(mendixButton).toHaveClass("btn-success");

        mendixButton.setProps({ style: "info" });
        expect(mendixButton).toHaveClass("btn-info");

        mendixButton.setProps({ style: "warning" });
        expect(mendixButton).toHaveClass("btn-warning");
    });

    it("should render an icon when a glyphicon is specified", () => {
        defaultProps.glyphIcon = "info-o";
        const mendixButton = renderMendixButton(defaultProps);

        expect(mendixButton.find(IconButton).length).toBe(1);
    });

    it("should not render an icon when no glyphicon is specified", () => {
        const mendixButton = renderMendixButton(defaultProps);

        expect(mendixButton.find(IconButton).length).toBe(0);
    });

    it("should render with the class disabled when configured as disabled", () => {
        defaultProps.disabled = true;
        const mendixButton = renderMendixButton(defaultProps);

        expect(mendixButton).toHaveClass("disabled");
    });

    it("should respond to click actions", () => {
        const mendixButton = renderMendixButton(defaultProps);
        mendixButton.simulate("click");

        expect(defaultProps.onClick).toHaveBeenCalled();
    });
});
