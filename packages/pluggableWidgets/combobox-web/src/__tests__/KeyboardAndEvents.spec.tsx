import "@testing-library/jest-dom";
jest.mock("../hooks/useFloatingMenu");
import { act, cleanup, fireEvent, render, RenderResult } from "@testing-library/react";
import { resetIdCounter } from "downshift";
import { ReferenceSetValueBuilder, actionValue, setupIntersectionObserverStub } from "@mendix/widget-plugin-test-utils";
import { ComboboxContainerProps } from "../../typings/ComboboxProps";
import Combobox from "../Combobox";
import { associationMultiProps, enumerationProps, itemA, itemB } from "../helpers/__tests__/fixtures";

function input(component: RenderResult): HTMLInputElement {
    return component.getByRole("combobox") as HTMLInputElement;
}

describe("Combo box keyboard, focus and events", () => {
    beforeAll(() => setupIntersectionObserverStub());
    beforeEach(() => resetIdCounter());

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
    it("drops the typed text when a single-select menu closes and keeps it for a multi-select", () => {
        const single = render(<Combobox {...enumerationProps()} />);
        fireEvent.click(input(single));
        fireEvent.change(input(single), { target: { value: "gr" } });
        fireEvent.click(single.container.querySelector(".widget-combobox-down-arrow")!);
        expect(input(single)).toHaveAttribute("aria-expanded", "false");
        expect(input(single).value).toBe("");
        single.unmount();

        const multi = render(<Combobox {...associationMultiProps()} />);
        fireEvent.click(input(multi));
        fireEvent.change(input(multi), { target: { value: "an" } });
        fireEvent.click(multi.container.querySelector(".widget-combobox-down-arrow")!);
        expect(input(multi)).toHaveAttribute("aria-expanded", "false");
        expect(input(multi).value).toBe("an");
    });

    describe("filter input action", () => {
        type FilterAction = NonNullable<ComboboxContainerProps["onChangeFilterInputEvent"]>;

        beforeEach(() => jest.useFakeTimers());
        afterEach(() => jest.useRealTimers());

        function renderWith(action: FilterAction, filterInputDebounceInterval = 200): HTMLInputElement {
            const component = render(
                <Combobox
                    {...enumerationProps(undefined, { onChangeFilterInputEvent: action, filterInputDebounceInterval })}
                />
            );
            const field = input(component);
            fireEvent.click(field);
            return field;
        }

        it("runs once with the last typed text after the debounce interval", () => {
            const action = actionValue<FilterAction>();
            const field = renderWith(action);

            fireEvent.change(field, { target: { value: "g" } });
            fireEvent.change(field, { target: { value: "gr" } });
            expect(action.execute).not.toHaveBeenCalled();

            act(() => jest.advanceTimersByTime(200));

            expect(action.execute).toHaveBeenCalledTimes(1);
            expect(action.execute).toHaveBeenCalledWith({ filterInput: "gr" });
        });

        it("waits for the configured interval", () => {
            const action = actionValue<FilterAction>();
            const field = renderWith(action, 500);

            fireEvent.change(field, { target: { value: "g" } });
            act(() => jest.advanceTimersByTime(499));
            expect(action.execute).not.toHaveBeenCalled();

            act(() => jest.advanceTimersByTime(1));
            expect(action.execute).toHaveBeenCalledTimes(1);
        });

        it("sends no text when the input is emptied", () => {
            const action = actionValue<FilterAction>();
            const field = renderWith(action);

            fireEvent.change(field, { target: { value: "g" } });
            fireEvent.change(field, { target: { value: "" } });
            act(() => jest.advanceTimersByTime(200));

            expect(action.execute).toHaveBeenLastCalledWith({ filterInput: undefined });
        });

        it("does not run when the action cannot execute or is already executing", () => {
            for (const action of [actionValue<FilterAction>(false), actionValue<FilterAction>(true, true)]) {
                const field = renderWith(action);
                fireEvent.change(field, { target: { value: "g" } });
                act(() => jest.advanceTimersByTime(200));
                expect(action.execute).not.toHaveBeenCalled();
                cleanup();
            }
        });
    });
});
