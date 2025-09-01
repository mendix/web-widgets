import { createElement } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Rating, RatingProps } from "../Rating";
import "@testing-library/jest-dom";

const defaultProps: RatingProps = {
    className: "",
    animated: true,
    disabled: false,
    emptyIcon: <div className="empty" />,
    fullIcon: <div className="full" />,
    value: 0,
    onChange: undefined,
    maximumValue: 5,
    style: undefined
};

function renderRating(props?: Partial<RatingProps>) {
    return render(<Rating {...defaultProps} {...props} />);
}

describe("Rating rendering", () => {
    it("renders correctly the structure", () => {
        const { asFragment } = renderRating();
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders correctly the structure when disabled", () => {
        const { asFragment } = renderRating({ disabled: true });
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders correctly the structure without animations", () => {
        const { asFragment } = renderRating({ animated: false });
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders correctly the structure with custom class", () => {
        const { asFragment } = renderRating({ className: "my-custom-class" });
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders the correct amount of items", () => {
        renderRating({ maximumValue: 2 });
        expect(screen.getAllByRole("radio")).toHaveLength(2);
    });

    it("renders the correct amount of items when value is superior to maximumValue", () => {
        const { container } = renderRating({ maximumValue: 2, value: 5 });
        expect(screen.getAllByRole("radio")).toHaveLength(2);
        expect(container.querySelectorAll(".full")).toHaveLength(2);
    });
});

describe("Rating events", () => {
    it("triggers the event with correct value on click", () => {
        const onChange = jest.fn();
        renderRating({ onChange });
        const radios = screen.getAllByRole("radio");
        fireEvent.click(radios[0]);
        expect(onChange).toHaveBeenCalledWith(1);
    });

    it("cleans the value when clicking twice at same value", () => {
        let value = 0;
        const onChange = jest.fn(v => {
            value = v;
        });
        const { rerender } = renderRating({ onChange, value });
        const radios = screen.getAllByRole("radio");
        fireEvent.click(radios[1]);
        expect(onChange).toHaveBeenCalledWith(2);
        rerender(<Rating {...defaultProps} onChange={onChange} value={2} />);
        fireEvent.click(radios[1]);
        expect(onChange).toHaveBeenCalledWith(0);
    });

    it("triggers the event with correct value on space key down", () => {
        const onChange = jest.fn();
        renderRating({ onChange });
        const radios = screen.getAllByRole("radio");
        fireEvent.keyDown(radios[0], { key: " " });
        expect(onChange).toHaveBeenCalledWith(1);
    });

    it("triggers the event with correct value on enter key down", () => {
        const onChange = jest.fn();
        renderRating({ onChange });
        const radios = screen.getAllByRole("radio");
        fireEvent.keyDown(radios[2], { key: "Enter" });
        expect(onChange).toHaveBeenCalledWith(3);
    });

    it("doesn't trigger any event when disabled", () => {
        const onChange = jest.fn();
        renderRating({ disabled: true, onChange });
        const radios = screen.getAllByRole("radio");
        fireEvent.keyDown(radios[1], { key: "Enter" });
        fireEvent.keyDown(radios[2], { key: " " });
        fireEvent.click(radios[3]);
        expect(onChange).not.toHaveBeenCalled();
    });
});
