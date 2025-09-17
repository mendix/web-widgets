import { createElement } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import Switch, { SwitchProps } from "../Switch";

describe("Switch", () => {
    const defaultProps: SwitchProps = {
        id: "switch-id",
        tabIndex: 0,
        isChecked: false,
        editable: true,
        validation: undefined
    };

    function renderSwitch(props: Partial<SwitchProps> = {}) {
        return render(<Switch {...{ ...defaultProps, ...props }} />);
    }

    it("renders with default props", () => {
        renderSwitch();
        expect(screen.getByRole("switch")).toBeInTheDocument();
        expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
        expect(screen.getByRole("switch")).toHaveAttribute("aria-disabled", "false");
    });

    it("shows checked state", () => {
        renderSwitch({ isChecked: true });
        expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
    });

    it("shows disabled state", () => {
        renderSwitch({ editable: false });
        expect(screen.getByRole("switch")).toHaveClass("disabled");
        expect(screen.getByRole("switch")).toHaveAttribute("aria-disabled", "true");
    });

    it("calls onClick when clicked", async () => {
        const user = userEvent.setup();
        const onClick = jest.fn();
        renderSwitch({ onClick });
        await user.click(screen.getByRole("switch"));
        expect(onClick).toHaveBeenCalled();
    });

    it("calls onKeyDown when key pressed", () => {
        const onKeyDown = jest.fn();
        renderSwitch({ onKeyDown });
        const switchEl = screen.getByRole("switch");
        switchEl.focus();
        fireEvent.keyDown(switchEl, { key: "Enter", code: "Enter", charCode: 13 });
        expect(onKeyDown).toHaveBeenCalled();
    });

    it("shows validation message", () => {
        renderSwitch({ validation: "Error!" });
        expect(screen.getByText("Error!")).toBeInTheDocument();
    });
});
