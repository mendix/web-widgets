import "@testing-library/jest-dom";
import { fireEvent, render } from "@testing-library/react";
import { resetIdCounter } from "downshift";
import { ReactElement } from "react";
import { setupIntersectionObserverStub } from "@mendix/widget-plugin-test-utils";
import { enumerationProps } from "../../helpers/__tests__/fixtures";
import { useComboboxCore } from "../../hooks/useComboboxCore";
import { ComboboxContainerProps } from "../../typings/ComboboxProps";
import { ComboboxView, ComboboxViewProps } from "../ComboboxView";
import { ComboboxParts } from "../parts";

jest.mock("../../hooks/useFloatingMenu");

/** The View over a live Core, the way the widget mounts it, so a command re-renders it. */
function Harness({ props, ...view }: { props: ComboboxContainerProps } & Omit<ComboboxViewProps, "vm">): ReactElement {
    const { vm } = useComboboxCore(props);
    return <ComboboxView vm={vm} {...view} />;
}

describe("ComboboxView", () => {
    beforeAll(() => setupIntersectionObserverStub());
    beforeEach(() => resetIdCounter());

    it("renders the Atlas classes and parts by default", () => {
        const { container } = render(<Harness props={enumerationProps()} />);

        expect(container.querySelector(".widget-combobox-input-container")).toBeInTheDocument();
        expect(
            container.querySelector(".widget-combobox-placeholder-text .widget-combobox-caption-text")
        ).toBeInTheDocument();
    });

    it("replaces the class of a given key everywhere it is used and keeps the other keys", () => {
        const { container } = render(
            <Harness props={enumerationProps()} classes={{ inputContainer: "my-box", caption: "my-caption" }} />
        );

        // a part's own element
        expect(container.querySelector(".my-box")).toBeInTheDocument();
        expect(container.querySelector(".widget-combobox-input-container")).not.toBeInTheDocument();
        // an element rendered by a component inside a part
        expect(container.querySelector(".widget-combobox-placeholder-text .my-caption")).toBeInTheDocument();
        expect(container.querySelector(".widget-combobox-caption-text")).not.toBeInTheDocument();
        // untouched keys
        expect(container.querySelector(".widget-combobox-input")).toBeInTheDocument();
        expect(container.querySelector(".widget-combobox-menu")).toBeInTheDocument();
    });

    it("renders a replaced part with the Behavior props of its element", () => {
        const Option: ComboboxParts["Option"] = ({ option, optionProps }) => (
            <li {...optionProps} data-testid="my-option">
                {option.caption.toUpperCase()}
            </li>
        );
        const component = render(<Harness props={enumerationProps()} parts={{ Option }} />);

        fireEvent.click(component.container.querySelector(".widget-combobox-down-arrow")!);

        const options = component.getAllByTestId("my-option");
        expect(options.length).toBeGreaterThan(0);
        expect(options[0]).toHaveAttribute("role", "option");
        expect(options[0]).toHaveAttribute("aria-selected");
        expect(options[0].textContent).toBe(options[0].textContent!.toUpperCase());
        // the other parts are still the Atlas ones
        expect(component.container.querySelector(".widget-combobox-menu-list")).toBeInTheDocument();
    });
});
