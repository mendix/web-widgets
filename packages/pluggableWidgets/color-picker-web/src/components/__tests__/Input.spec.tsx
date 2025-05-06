import "@testing-library/jest-dom";
import { render, RenderResult } from "@testing-library/react";
import { createElement, ReactElement } from "react";
import { Input, InputProps } from "../Input";

describe("Input", () => {
    let inputProps: InputProps;

    beforeEach(() => {
        inputProps = {
            color: "#000000",
            disabled: false,
            children: null,
            onChange: jest.fn()
        };
    });

    function renderInput(configs: Partial<InputProps> = {}, children: ReactElement): RenderResult {
        return render(
            <Input {...inputProps} {...configs}>
                {children}
            </Input>
        );
    }

    it("render DOM structure", () => {
        const { asFragment } = render(<Input {...inputProps} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders the structure correctly", () => {
        const inputChildren = (
            <div>
                <button />
            </div>
        );
        const { container, getByRole } = renderInput(inputProps, inputChildren);

        const containerDiv = container.firstChild;
        expect(containerDiv).toHaveClass("widget-color-picker-input-container");

        // Assert the input element
        const inputElement = getByRole("textbox");
        expect(inputElement).toHaveClass("form-control");
        expect(inputElement).toBeEnabled();
        expect(inputElement).toHaveValue(inputProps.color);

        // Assert the children
        const buttonElement = container.querySelector("button");
        expect(buttonElement).toBeInTheDocument();
    });
});
