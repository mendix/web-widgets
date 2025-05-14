import "@testing-library/jest-dom";
import { act, render, RenderResult } from "@testing-library/react";
import { createElement } from "react";
import { Button, ButtonProps } from "../Button";

describe("Button", () => {
    let buttonProps: ButtonProps;

    beforeEach(() => {
        buttonProps = {
            color: "#000000",
            disabled: false,
            mode: "popover",
            onClick: jest.fn()
        };
    });

    function renderButton(configs: Partial<ButtonProps> = {}): RenderResult {
        return render(<Button {...buttonProps} {...configs} />);
    }

    it("render DOM structure", () => {
        const button = render(<Button {...buttonProps} />);
        expect(button.asFragment()).toMatchSnapshot();
    });

    it("renders the structure correctly", () => {
        const { getByRole, rerender } = renderButton();

        const button = getByRole("button");
        expect(button).toHaveClass("btn");

        act(() => {
            rerender(<Button {...buttonProps} disabled />);
        });
        expect(button).toHaveClass("disabled");

        act(() => {
            rerender(<Button {...buttonProps} mode="input" />);
        });
        expect(button).toHaveClass("widget-color-picker-input");

        act(() => {
            rerender(<Button {...buttonProps} mode="inline" />);
        });
        expect(button).toHaveClass("hidden");
    });
});
