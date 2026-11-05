import "@testing-library/jest-dom";
import { fireEvent, render, RenderResult, screen, waitFor, within } from "@testing-library/react";
import { resetIdCounter } from "downshift";
import { ComponentType, ReactElement } from "react";
import {
    actionValue,
    EditableValueBuilder,
    ReferenceSetValueBuilder,
    setupIntersectionObserverStub
} from "@mendix/widget-plugin-test-utils";
import { ComboboxViewModel } from "../core/ComboboxViewModel";
import { associationMultiProps, enumerationProps, itemA, itemB, itemC, itemD } from "../helpers/__tests__/fixtures";
import { useComboboxCore } from "../hooks/useComboboxCore";
import { ComboboxContainerProps } from "../typings/ComboboxProps";

/** Any View that renders the combobox ViewModel. */
export type ComboboxConformanceView = ComponentType<{ vm: ComboboxViewModel }>;

function Harness({ props, View }: { props: ComboboxContainerProps; View: ComboboxConformanceView }): ReactElement {
    const { vm } = useComboboxCore(props);
    return <View vm={vm} />;
}

interface Mounted {
    component: RenderResult;
    input: HTMLInputElement;
    /** Pushes the (mutated) props again, the way the Mendix client re-renders after a write. */
    update(): void;
}

function mount(View: ComboboxConformanceView, props: ComboboxContainerProps): Mounted {
    const component = render(<Harness props={props} View={View} />);
    return {
        component,
        input: component.getByRole("combobox") as HTMLInputElement,
        // A fresh props object, as the Mendix client passes one: the same object would not be seen as a change.
        update: () => component.rerender(<Harness props={{ ...props }} View={View} />)
    };
}

function captions(): string[] {
    return screen.queryAllByRole("option").map(option => option.textContent ?? "");
}

function highlighted(input: HTMLInputElement): HTMLElement | null {
    const id = input.getAttribute("aria-activedescendant");
    return id ? document.getElementById(id) : null;
}

/**
 * The behaviour the combobox promises whatever its View: a combobox input that opens on click and
 * with the arrow keys, a listbox of options that tracks selection and highlight through ARIA,
 * selection with Enter and click, dismissal with Escape and on leaving the widget, the clear and
 * remove controls, read-only, validation, select-all and the live region. Queries are role-based;
 * nothing here depends on class names, markup or the Behavior. Every case runs against the Atlas
 * View in CI and against any other View that calls this function from a spec.
 * See docs/design/headless-widgets.md, section 11.
 */
export function describeComboboxConformance(name: string, View: ComboboxConformanceView): void {
    describe(`${name}: combobox conformance`, () => {
        beforeAll(() => setupIntersectionObserverStub());
        beforeEach(() => resetIdCounter());

        describe("single selection", () => {
            it("renders a closed combobox input", () => {
                const { input } = mount(View, enumerationProps());

                expect(input).toHaveAttribute("aria-expanded", "false");
                expect(screen.queryAllByRole("option")).toHaveLength(0);
                // The Studio Pro label is rendered by the client as `<label for={widget id}>`.
                expect(input).toHaveAttribute("id", "comboBox1");
            });

            it("shows the empty option text while nothing is selected", () => {
                const attribute = new EditableValueBuilder<string>().withUniverse("red", "green").build();
                mount(View, enumerationProps(attribute));

                // As visible text or as the input's placeholder, whichever the View chooses.
                expect(
                    screen.queryByText("Select...") ?? screen.queryByPlaceholderText("Select...")
                ).toBeInTheDocument();
            });

            it("opens on click, lists every option with its caption and marks the selected one", () => {
                const { input } = mount(View, enumerationProps());

                fireEvent.click(input);

                expect(input).toHaveAttribute("aria-expanded", "true");
                expect(screen.getByRole("listbox")).toBeInTheDocument();
                expect(captions()).toEqual(["Formatted red", "Formatted green", "Formatted blue"]);
                expect(screen.getByRole("option", { name: "Formatted green" })).toHaveAttribute(
                    "aria-selected",
                    "true"
                );
                expect(screen.getByRole("option", { name: "Formatted red" })).toHaveAttribute("aria-selected", "false");
            });

            it("opens with ArrowDown and moves the highlight with the arrow keys", () => {
                const { input } = mount(View, enumerationProps());

                fireEvent.keyDown(input, { key: "ArrowDown" });

                expect(input).toHaveAttribute("aria-expanded", "true");
                const first = highlighted(input);
                expect(first).toHaveAttribute("role", "option");
                fireEvent.keyDown(input, { key: "ArrowDown" });
                expect(highlighted(input)).not.toBe(first);
                fireEvent.keyDown(input, { key: "ArrowUp" });
                expect(highlighted(input)).toBe(first);
            });

            it("selects the highlighted option with Enter, writes the value and closes", () => {
                const props = enumerationProps();
                const { input } = mount(View, props);

                fireEvent.keyDown(input, { key: "ArrowDown" });
                for (let i = 0; i < 3 && highlighted(input)?.textContent !== "Formatted blue"; i++) {
                    fireEvent.keyDown(input, { key: "ArrowDown" });
                }
                expect(highlighted(input)).toHaveTextContent("Formatted blue");
                fireEvent.keyDown(input, { key: "Enter" });

                expect(props.attributeEnumeration.setValue).toHaveBeenCalledWith("blue");
                expect(input).toHaveAttribute("aria-expanded", "false");
            });

            it("selects an option with a click and closes", () => {
                const props = enumerationProps();
                const { input } = mount(View, props);

                fireEvent.click(input);
                fireEvent.click(screen.getByRole("option", { name: "Formatted blue" }));

                expect(props.attributeEnumeration.setValue).toHaveBeenCalledWith("blue");
                expect(input).toHaveAttribute("aria-expanded", "false");
            });

            it("filters the options by the typed text and shows the no-options text when nothing matches", () => {
                const { input } = mount(View, enumerationProps());
                fireEvent.click(input);

                fireEvent.change(input, { target: { value: "bl" } });
                expect(captions()).toEqual(["Formatted blue"]);

                fireEvent.change(input, { target: { value: "zzz" } });
                expect(within(screen.getByRole("listbox")).getByText("No options")).toBeInTheDocument();
            });

            it("closes with Escape and keeps the selection", () => {
                const props = enumerationProps();
                const { input } = mount(View, props);
                fireEvent.click(input);

                fireEvent.keyDown(input, { key: "Escape" });

                expect(input).toHaveAttribute("aria-expanded", "false");
                expect(props.attributeEnumeration.setValue).not.toHaveBeenCalled();
            });

            it("runs the enter and leave actions when focus crosses the widget, and leaving closes the menu", () => {
                const onEnterEvent = actionValue();
                const onLeaveEvent = actionValue();
                const { input } = mount(View, enumerationProps(undefined, { onEnterEvent, onLeaveEvent }));

                fireEvent.focus(input);
                expect(onEnterEvent.execute).toHaveBeenCalledTimes(1);

                fireEvent.click(input);
                expect(input).toHaveAttribute("aria-expanded", "true");
                fireEvent.blur(input);

                expect(onLeaveEvent.execute).toHaveBeenCalledTimes(1);
                expect(input).toHaveAttribute("aria-expanded", "false");
            });

            it("clears the selection with the clear control, which goes away with the selection", () => {
                const props = enumerationProps();
                const { update } = mount(View, props);

                fireEvent.click(screen.getByRole("button", { name: "Clear" }));

                expect(props.attributeEnumeration.setValue).toHaveBeenCalledWith(undefined);
                update();
                expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
            });

            it("disables the input and hides the clear control while read-only", () => {
                const attribute = new EditableValueBuilder<string>()
                    .withUniverse("red", "green")
                    .withValue("green")
                    .isReadOnly()
                    .build();
                const { input } = mount(View, enumerationProps(attribute));

                expect(input).toBeDisabled();
                expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
            });

            it("links the validation message to the input", () => {
                const attribute = new EditableValueBuilder<string>()
                    .withUniverse("red")
                    .withValue("red")
                    .withValidation("Required")
                    .build();
                const { input } = mount(View, enumerationProps(attribute));

                expect(input).toHaveAttribute("aria-invalid", "true");
                const describedBy = input.getAttribute("aria-describedby");
                expect(describedBy).toBeTruthy();
                expect(document.getElementById(describedBy!)).toHaveTextContent("Required");
            });

            it("announces the option count in a live region while open", async () => {
                const { input } = mount(View, enumerationProps());

                fireEvent.click(input);

                await waitFor(() => {
                    expect(screen.getByRole("status")).toHaveTextContent("Options available: 3");
                });
            });
        });

        describe("multiple selection", () => {
            function multiProps(selected = [itemA]): ComboboxContainerProps {
                return associationMultiProps({
                    attr: new ReferenceSetValueBuilder().withValue(selected).build(),
                    selectedItemsStyle: "boxes",
                    selectAllButton: true
                });
            }

            it("shows the selected items and removes one with its remove control", () => {
                const props = multiProps([itemA, itemB]);
                const { component } = mount(View, props);

                expect(component.container).toHaveTextContent("Apple");
                expect(component.container).toHaveTextContent("Banana");
                const removes = screen.getAllByRole("button", { name: "Remove" });
                expect(removes).toHaveLength(2);

                fireEvent.click(removes[0]);

                expect(props.attributeAssociation.setValue).toHaveBeenCalledWith([itemB]);
            });

            it("keeps the menu open after selecting an option and marks it selected", () => {
                const props = multiProps();
                const { input, update } = mount(View, props);

                fireEvent.click(input);
                expect(screen.getByRole("listbox")).toHaveAttribute("aria-multiselectable", "true");
                fireEvent.click(screen.getByRole("option", { name: "Banana" }));

                expect(props.attributeAssociation.setValue).toHaveBeenCalledWith([itemA, itemB]);
                update();
                expect(input).toHaveAttribute("aria-expanded", "true");
                expect(screen.getByRole("option", { name: "Banana" })).toHaveAttribute("aria-selected", "true");
            });

            it("deselects a selected option on click", () => {
                const props = multiProps();
                const { input } = mount(View, props);

                fireEvent.click(input);
                fireEvent.click(screen.getByRole("option", { name: "Apple" }));

                expect(props.attributeAssociation.setValue).toHaveBeenCalledWith([]);
            });

            it("selects every option with the select-all control", () => {
                const props = multiProps();
                const { input } = mount(View, props);

                fireEvent.click(input);
                fireEvent.click(screen.getByRole("checkbox", { name: "Select all" }));

                expect(props.attributeAssociation.setValue).toHaveBeenCalledWith([itemA, itemB, itemC, itemD]);
            });
        });
    });
}
