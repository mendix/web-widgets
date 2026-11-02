import "@testing-library/jest-dom";
jest.mock("../useFloatingMenu");
import { fireEvent, render, RenderResult } from "@testing-library/react";
import { resetIdCounter } from "downshift";
import { ReferenceSetValueBuilder, actionValue, setupIntersectionObserverStub } from "@mendix/widget-plugin-test-utils";
import Combobox from "../../Combobox";
import { associationMultiProps, enumerationProps, itemA, itemB } from "../../helpers/__tests__/fixtures";

function input(component: RenderResult): HTMLInputElement {
    return component.getByRole("combobox") as HTMLInputElement;
}

/**
 * The "behaviour that must survive" list of docs/design/headless-combobox.md, section 4, as far as
 * the component specs do not cover it already (chip navigation, focus after chip removal and lazy
 * loading live in the MultiSelection and SingleSelection specs).
 */
describe("useComboboxBehavior", () => {
    beforeAll(() => setupIntersectionObserverStub());
    beforeEach(() => resetIdCounter());

    it("carries the open, highlighted and selected state as data attributes", () => {
        const props = enumerationProps();
        const component = render(<Combobox {...props} />);
        const query = (selector: string): Element => component.container.querySelector(selector)!;
        const menu = query(".widget-combobox-menu");
        const inputContainer = query(".widget-combobox-input-container");
        const toggle = query(".widget-combobox-down-arrow");

        expect(menu).not.toHaveAttribute("data-open");
        expect(inputContainer).not.toHaveAttribute("data-open");

        fireEvent.click(toggle);

        expect(menu).toHaveAttribute("data-open", "true");
        expect(inputContainer).toHaveAttribute("data-open", "true");
        expect(toggle).toHaveAttribute("data-open", "true");
        expect(query(".widget-combobox-menu-list")).toHaveAttribute("data-highlighted", "true");
        const options = component.getAllByRole("option");
        expect(options[0]).toHaveAttribute("data-highlighted", "true");
        expect(options[1]).not.toHaveAttribute("data-highlighted");
        // data-selected follows aria-selected on every option.
        for (const option of options) {
            expect(option.hasAttribute("data-selected")).toBe(option.getAttribute("aria-selected") === "true");
        }

        const unselected = options.find(option => option.getAttribute("aria-selected") === "false")!;
        const caption = unselected.textContent!;
        fireEvent.click(unselected);
        component.rerender(<Combobox {...props} />);
        fireEvent.click(toggle);

        const selected = component.getByRole("option", { name: caption });
        expect(selected).toHaveAttribute("aria-selected", "true");
        expect(selected).toHaveAttribute("data-selected", "true");
    });

    it("clears a clearable single selection with Backspace on an empty input", () => {
        const props = enumerationProps();
        const component = render(<Combobox {...props} />);

        fireEvent.keyDown(input(component), { key: "Backspace" });

        expect(props.attributeEnumeration.setValue).toHaveBeenLastCalledWith(undefined);
    });

    it("toggles the highlighted item with Space in multi mode and keeps the menu open", async () => {
        const attr = new ReferenceSetValueBuilder().withValue([itemA]).build();
        const props = associationMultiProps({ attr });
        const component = render(<Combobox {...props} />);
        const field = input(component);

        fireEvent.click(field);
        // A multi-select menu opens with no highlight; two ArrowDown presses reach the second option.
        fireEvent.keyDown(field, { key: "ArrowDown" });
        fireEvent.keyDown(field, { key: "ArrowDown" });
        fireEvent.keyDown(field, { key: " " });

        expect(attr.setValue).toHaveBeenLastCalledWith([itemA, itemB]);
        expect(field).toHaveAttribute("aria-expanded", "true");
    });

    it("closes the menu and drops the typed text on Escape", async () => {
        const component = render(<Combobox {...enumerationProps()} />);
        const field = input(component);

        fireEvent.click(field);
        fireEvent.change(field, { target: { value: "gr" } });
        expect(component.getAllByRole("option")).toHaveLength(1);

        fireEvent.keyDown(field, { key: "Escape" });

        expect(field).toHaveAttribute("aria-expanded", "false");
        expect(field.value).toBe("");
    });

    it("runs the enter and leave actions when focus crosses the widget boundary, and leave closes the menu", () => {
        const onEnterEvent = actionValue();
        const onLeaveEvent = actionValue();
        const component = render(
            <div>
                <Combobox {...enumerationProps(undefined, { onEnterEvent, onLeaveEvent })} />
                <button>outside</button>
            </div>
        );
        const field = input(component);
        const outside = component.getByText("outside");

        fireEvent.focus(field, { relatedTarget: outside });
        expect(onEnterEvent.execute).toHaveBeenCalledTimes(1);

        fireEvent.click(field);
        fireEvent.change(field, { target: { value: "gr" } });
        expect(field).toHaveAttribute("aria-expanded", "true");

        fireEvent.blur(field, { relatedTarget: outside });
        expect(onLeaveEvent.execute).toHaveBeenCalledTimes(1);
        expect(field).toHaveAttribute("aria-expanded", "false");
        expect(field.value).toBe("");
    });

    it("opens a multi-select menu with no highlight and a single-select menu on its first option", () => {
        const multi = render(<Combobox {...associationMultiProps()} />);
        fireEvent.click(multi.container.querySelector(".widget-combobox-down-arrow")!);
        expect(input(multi)).toHaveAttribute("aria-expanded", "true");
        expect(input(multi)).toHaveAttribute("aria-activedescendant", "");
        fireEvent.keyDown(input(multi), { key: "ArrowDown" });
        expect(input(multi)).toHaveAttribute("aria-activedescendant", multi.getAllByRole("option")[0].id);
        multi.unmount();

        const single = render(<Combobox {...enumerationProps()} />);
        fireEvent.click(single.container.querySelector(".widget-combobox-down-arrow")!);
        expect(input(single)).toHaveAttribute("aria-activedescendant", single.getAllByRole("option")[0].id);
    });

    it("does not treat focus moving inside the widget as enter or leave", () => {
        const onEnterEvent = actionValue();
        const onLeaveEvent = actionValue();
        const component = render(<Combobox {...enumerationProps(undefined, { onEnterEvent, onLeaveEvent })} />);
        const field = input(component);
        const toggle = component.container.querySelector(".widget-combobox-down-arrow")!;

        fireEvent.blur(field, { relatedTarget: toggle });
        fireEvent.focus(field, { relatedTarget: toggle });

        expect(onEnterEvent.execute).not.toHaveBeenCalled();
        expect(onLeaveEvent.execute).not.toHaveBeenCalled();
    });

    it("keeps the input focused when the menu list is pressed", () => {
        const component = render(<Combobox {...enumerationProps()} />);
        fireEvent.click(input(component));

        const prevented = !fireEvent.mouseDown(component.getByRole("listbox"));

        expect(prevented).toBe(true);
    });
});
