import "@testing-library/jest-dom";
jest.mock("../hooks/useFloatingMenu");
import { fireEvent, render, RenderResult, waitFor } from "@testing-library/react";
import { resetIdCounter } from "downshift";
import { ListValue } from "mendix";
import {
    dynamic,
    EditableValueBuilder,
    list,
    ListAttributeValueBuilder,
    listExpression,
    obj,
    ReferenceSetValueBuilder,
    setupIntersectionObserverStub
} from "@mendix/widget-plugin-test-utils";
import { ComboboxContainerProps, OptionsSourceAssociationCaptionTypeEnum } from "../../typings/ComboboxProps";
import Combobox from "../Combobox";

async function getInput(component: RenderResult): Promise<HTMLInputElement> {
    return (await component.findByRole("combobox")) as HTMLInputElement;
}

describe("Combo box (Association)", () => {
    beforeAll(() => {
        setupIntersectionObserverStub();
    });
    let defaultProps: ComboboxContainerProps;
    beforeEach(() => {
        resetIdCounter();
        defaultProps = {
            name: "comboBox",
            id: "comboBox1",
            source: "context",
            optionsSourceType: "association",
            attributeAssociation: new ReferenceSetValueBuilder().withValue([obj("111")]).build(),
            attributeEnumeration: new EditableValueBuilder<string>().build(),
            attributeBoolean: new EditableValueBuilder<boolean>().build(),
            optionsSourceAssociationDataSource: list([obj("111"), obj("222"), obj("333"), obj("444")]),
            optionsSourceAssociationCaptionType: "expression",
            optionsSourceAssociationCaptionAttribute: new ListAttributeValueBuilder<string>().build(),
            optionsSourceAssociationCaptionExpression: listExpression(() => "$currentObject/CountryName"),
            optionsSourceAssociationCustomContentType: "no",
            optionsSourceAssociationCustomContent: undefined,
            emptyOptionText: dynamic.available("Select an option 111"),
            ariaRequired: dynamic.available(true),
            clearable: true,
            filterType: "contains",
            selectedItemsStyle: "text",
            readOnlyStyle: "bordered",
            lazyLoading: false,
            loadingType: "spinner",
            noOptionsText: dynamic.available("no options found"),
            clearButtonAriaLabel: dynamic.available("Clear selection"),
            removeValueAriaLabel: dynamic.available("Remove value"),
            selectAllButton: true, // Causes +1 option to be added to the menu
            selectAllButtonCaption: dynamic.available("Select All"),
            selectionMethod: "checkbox",
            a11ySelectedValue: dynamic.available("Selected value:"),
            a11yOptionsAvailable: dynamic.available("Options available:"),
            a11yInstructions: dynamic.available("a11yInstructions"),
            showFooter: false,
            databaseAttributeString: new EditableValueBuilder<string | Big>().build(),
            optionsSourceDatabaseCaptionType: "attribute",
            optionsSourceDatabaseCustomContentType: "yes",
            staticDataSourceCustomContentType: "no",
            staticAttribute: new EditableValueBuilder<string>().build(),
            optionsSourceStaticDataSource: [
                {
                    staticDataSourceValue: dynamic.available("value1"),
                    staticDataSourceCustomContent: undefined,
                    staticDataSourceCaption: dynamic.available("caption1")
                },
                {
                    staticDataSourceValue: dynamic.available("value2"),
                    staticDataSourceCustomContent: undefined,
                    staticDataSourceCaption: dynamic.available("caption2")
                }
            ],
            selectedItemsSorting: "none",
            customEditability: "default",
            customEditabilityExpression: dynamic.available(false),
            filterInputDebounceInterval: 200
        };
        if (defaultProps.optionsSourceAssociationCaptionType === "expression") {
            defaultProps.optionsSourceAssociationCaptionExpression!.get = i => dynamic.available(`${i.id}`);
        }
    });

    it("renders combobox widget", () => {
        const component = render(<Combobox {...defaultProps} />);
        expect(component.container).toMatchSnapshot();
    });
    it("renders placeholder component in case of unavailable status", () => {
        defaultProps.attributeAssociation = new ReferenceSetValueBuilder().isUnavailable().build();
        const { container } = render(<Combobox {...defaultProps} />);
        expect(container.getElementsByClassName("widget-combobox-placeholder")).toHaveLength(1);
    });
    it("positions the open menu via floating-ui (applies floatingStyles to the menu)", async () => {
        const component = render(<Combobox {...defaultProps} />);
        const input = await getInput(component);
        fireEvent.click(input);
        await waitFor(() => {
            expect(component.getAllByRole("option")).toHaveLength(4);
        });
        const menu = component.container.querySelector(".widget-combobox-menu") as HTMLElement;
        expect(menu.style.getPropertyValue("--this-is-mocked-from-unit-tests")).toEqual("true");
    });
    it("toggles combobox menu on: input CLICK(focus) / BLUR", async () => {
        const component = render(<Combobox {...defaultProps} />);
        const input = await getInput(component);
        await fireEvent.click(input);
        await waitFor(() => {
            expect(component.getAllByRole("option")).toHaveLength(4);
        });
        fireEvent.blur(input);
        expect(component.queryAllByRole("option")).toHaveLength(0);
        expect(component.container).toMatchSnapshot();
    });
    it("toggles combobox menu on: input TOGGLE BUTTON", async () => {
        const component = render(<Combobox {...defaultProps} />);
        const toggleButton = await component.container.querySelector(".widget-combobox-down-arrow")!;

        fireEvent.click(toggleButton);
        waitFor(() => {
            expect(component.getAllByRole("option")).toHaveLength(4);
        });
        fireEvent.click(toggleButton);
        expect(component.queryAllByRole("option")).toHaveLength(0);
        expect(component.container).toMatchSnapshot();
    });
    it("adds new item to inital selected item", async () => {
        const component = render(<Combobox {...defaultProps} />);
        const input = await getInput(component);

        fireEvent.click(input);
        waitFor(() => {
            expect(component.queryAllByRole("option")).toHaveLength(4);
        });
        const option1 = await component.findByText("obj_222");
        fireEvent.click(option1);
        expect(defaultProps.attributeAssociation?.setValue).toHaveBeenCalled();
        expect(defaultProps.attributeAssociation?.value).toEqual([{ id: "obj_111" }, { id: "obj_222" }]);
    });
    it("removes selected item", async () => {
        const component = render(<Combobox {...defaultProps} />);
        const input = await getInput(component);
        fireEvent.click(input);
        await waitFor(() => {
            expect(component.queryAllByRole("option")).toHaveLength(4);
        });
        const option1 = await component.findByText("obj_222");
        fireEvent.click(option1);
        expect(defaultProps.attributeAssociation?.setValue).toHaveBeenCalled();
        expect(defaultProps.attributeAssociation?.value).toEqual([{ id: "obj_111" }, { id: "obj_222" }]);

        const clearButton = await component.container.getElementsByClassName("widget-combobox-clear-button")[0];
        fireEvent.click(clearButton);
        expect(defaultProps.attributeAssociation?.value).toEqual([]);
    });
    it("selects all items with the Select All button", async () => {
        const component = render(<Combobox {...defaultProps} />);
        const input = await getInput(component);
        fireEvent.click(input);
        await waitFor(() => {
            expect(component.queryAllByRole("option")).toHaveLength(4);
        });
        const selectAllButton = await component.container.querySelector(".widget-combobox-menu-header input")!; // component.queryAllByRole("option")[0];
        expect(defaultProps.attributeAssociation?.value).toHaveLength(1);
        fireEvent.click(selectAllButton);
        expect(defaultProps.attributeAssociation?.value).toHaveLength(4);
    });

    describe("filter input keys vs chip navigation (WC-3347)", () => {
        // These assert WHERE the key goes: text editing in the filter input, or focus
        // transfer to the selected items (chips). jsdom does not perform native text
        // deletion on keyDown, so chip activation is the observable under test.
        async function setup(
            overrides: Partial<ComboboxContainerProps> = {}
        ): Promise<{ component: RenderResult; input: HTMLInputElement }> {
            const component = render(<Combobox {...defaultProps} selectedItemsStyle="boxes" {...overrides} />);
            const input = await getInput(component);
            fireEvent.click(input);
            await waitFor(() => {
                expect(component.getAllByRole("option")).toHaveLength(4);
            });
            return { component, input };
        }

        function chips(component: RenderResult): HTMLElement[] {
            return Array.from(
                component.container.getElementsByClassName("widget-combobox-selected-item")
            ) as HTMLElement[];
        }

        function type(input: HTMLInputElement, value: string): void {
            fireEvent.change(input, { target: { value } });
        }

        it.each(["Backspace", "Delete"])(
            "keeps focus in the filter input when %s is pressed with all text selected",
            async key => {
                const { component, input } = await setup();
                type(input, "zzz");
                expect(input.value).toBe("zzz");
                input.setSelectionRange(0, 3);

                fireEvent.keyDown(input, { key });

                expect(document.activeElement).toBe(input);
                expect(chips(component).some(chip => chip === document.activeElement)).toBe(false);
            }
        );

        it("keeps focus in the filter input when Backspace is pressed with a partial selection from position 0", async () => {
            const { component, input } = await setup();
            type(input, "zzz");
            input.setSelectionRange(0, 2);

            fireEvent.keyDown(input, { key: "Backspace" });

            expect(document.activeElement).toBe(input);
            expect(chips(component).some(chip => chip === document.activeElement)).toBe(false);
        });

        it("keeps focus in the filter input when Backspace is pressed with the caret at the end of the text", async () => {
            const { component, input } = await setup();
            type(input, "zzz");
            input.setSelectionRange(3, 3);

            fireEvent.keyDown(input, { key: "Backspace" });

            expect(document.activeElement).toBe(input);
            expect(chips(component).some(chip => chip === document.activeElement)).toBe(false);
        });

        it("activates the last chip when Backspace is pressed with an empty filter input", async () => {
            const { component, input } = await setup();
            expect(input.value).toBe("");
            input.setSelectionRange(0, 0);

            fireEvent.keyDown(input, { key: "Backspace" });

            const allChips = chips(component);
            expect(allChips).toHaveLength(1);
            await waitFor(() => {
                expect(document.activeElement).toBe(allChips[allChips.length - 1]);
            });
        });

        it("does not throw when Backspace is pressed with an empty filter input and no chips", async () => {
            const { component, input } = await setup({
                attributeAssociation: new ReferenceSetValueBuilder().withValue([]).build()
            });
            expect(chips(component)).toHaveLength(0);

            expect(() => fireEvent.keyDown(input, { key: "Backspace" })).not.toThrow();
        });

        it("does not activate a chip when a modifier key is held", async () => {
            const { component, input } = await setup();
            input.setSelectionRange(0, 0);

            fireEvent.keyDown(input, { key: "Backspace", ctrlKey: true });

            expect(chips(component).some(chip => chip === document.activeElement)).toBe(false);
        });

        it("activates the last chip on ArrowLeft with a collapsed caret at position 0 in boxes style", async () => {
            const { component, input } = await setup();
            type(input, "zzz");
            input.setSelectionRange(0, 0);

            fireEvent.keyDown(input, { key: "ArrowLeft" });

            const allChips = chips(component);
            await waitFor(() => {
                expect(document.activeElement).toBe(allChips[allChips.length - 1]);
            });
        });

        it("keeps focus in the filter input on ArrowLeft when text is selected in boxes style", async () => {
            const { component, input } = await setup();
            type(input, "zzz");
            input.setSelectionRange(0, 3);

            fireEvent.keyDown(input, { key: "ArrowLeft" });

            expect(document.activeElement).toBe(input);
            expect(chips(component).some(chip => chip === document.activeElement)).toBe(false);
        });
    });

    describe("focus after keyboard chip removal", () => {
        // downshift only re-focuses a chip when its own activeIndex changes, which it does
        // not when a chip other than the last one is removed. These assert that focus stays
        // on the chip row instead of dropping to document.body.
        interface Setup {
            component: RenderResult;
            input: HTMLInputElement;
            /**
             * The mocked reference set updates its value in place instead of pushing new
             * props, so re-render the widget to model the Mendix client feeding the new
             * value back in — which is what removes the chip from the DOM.
             */
            applyValueChange: () => void;
        }

        async function setup(objectIds: string[]): Promise<Setup> {
            const props: ComboboxContainerProps = {
                ...defaultProps,
                selectedItemsStyle: "boxes",
                attributeAssociation: new ReferenceSetValueBuilder().withValue(objectIds.map(obj)).build()
            };
            const component = render(<Combobox {...props} />);
            const input = await getInput(component);
            return {
                component,
                input,
                applyValueChange: () => component.rerender(<Combobox {...props} />)
            };
        }

        function chips(component: RenderResult): HTMLElement[] {
            return Array.from(
                component.container.getElementsByClassName("widget-combobox-selected-item")
            ) as HTMLElement[];
        }

        function captions(component: RenderResult): string[] {
            return chips(component).map(chip => chip.textContent ?? "");
        }

        /** Walks from the filter input onto the chip at `index`, the way a keyboard user does. */
        async function focusChip(component: RenderResult, input: HTMLInputElement, index: number): Promise<void> {
            input.setSelectionRange(0, 0);
            fireEvent.keyDown(input, { key: "ArrowLeft" });
            const allChips = chips(component);
            await waitFor(() => {
                expect(document.activeElement).toBe(allChips[allChips.length - 1]);
            });

            for (let current = allChips.length - 1; current > index; current--) {
                fireEvent.keyDown(document.activeElement!, { key: "ArrowLeft" });
                const expected = chips(component)[current - 1];
                await waitFor(() => {
                    expect(document.activeElement).toBe(expected);
                });
            }
        }

        it.each(["Backspace", "Delete"])(
            "moves focus to the chip that took its place when %s removes a middle chip",
            async key => {
                const { component, input, applyValueChange } = await setup(["111", "222", "333"]);
                await focusChip(component, input, 1);

                fireEvent.keyDown(document.activeElement!, { key });
                applyValueChange();

                expect(captions(component)).toEqual(["obj_111", "obj_333"]);
                await waitFor(() => {
                    expect(document.activeElement).toBe(chips(component)[1]);
                });
                expect(document.activeElement).not.toBe(document.body);
            }
        );

        it.each(["Backspace", "Delete"])(
            "moves focus to the new first chip when %s removes the first chip",
            async key => {
                const { component, input, applyValueChange } = await setup(["111", "222", "333"]);
                await focusChip(component, input, 0);

                fireEvent.keyDown(document.activeElement!, { key });
                applyValueChange();

                expect(captions(component)).toEqual(["obj_222", "obj_333"]);
                await waitFor(() => {
                    expect(document.activeElement).toBe(chips(component)[0]);
                });
                expect(document.activeElement).not.toBe(document.body);
            }
        );

        it.each(["Backspace", "Delete"])(
            "moves focus to the left neighbour when %s removes the last chip",
            async key => {
                const { component, input, applyValueChange } = await setup(["111", "222", "333"]);
                await focusChip(component, input, 2);

                fireEvent.keyDown(document.activeElement!, { key });
                applyValueChange();

                expect(captions(component)).toEqual(["obj_111", "obj_222"]);
                await waitFor(() => {
                    expect(document.activeElement).toBe(chips(component)[1]);
                });
                expect(document.activeElement).not.toBe(document.body);
            }
        );

        it.each(["Backspace", "Delete"])(
            "returns focus to the filter input when %s removes the only chip",
            async key => {
                const { component, input, applyValueChange } = await setup(["111"]);
                await focusChip(component, input, 0);

                fireEvent.keyDown(document.activeElement!, { key });
                applyValueChange();

                expect(chips(component)).toHaveLength(0);
                await waitFor(() => {
                    expect(document.activeElement).toBe(input);
                });
            }
        );

        it("keeps chip navigation working after a middle chip is removed", async () => {
            const { component, input, applyValueChange } = await setup(["111", "222", "333"]);
            await focusChip(component, input, 1);

            fireEvent.keyDown(document.activeElement!, { key: "Delete" });
            applyValueChange();
            expect(captions(component)).toEqual(["obj_111", "obj_333"]);
            await waitFor(() => {
                expect(document.activeElement).toBe(chips(component)[1]);
            });

            fireEvent.keyDown(document.activeElement!, { key: "ArrowLeft" });

            await waitFor(() => {
                expect(document.activeElement).toBe(chips(component)[0]);
            });
        });
    });

    describe("with lazy loading", () => {
        it("calls loadMore only when menu opens", async () => {
            const setLimit = jest.fn();
            const lazyLoadingProps = {
                ...defaultProps,
                lazyLoading: true,
                optionsSourceAssociationCaptionType: "attribute" as OptionsSourceAssociationCaptionTypeEnum,
                optionsSourceAssociationDataSource: {
                    ...defaultProps.optionsSourceAssociationDataSource,
                    hasMoreItems: true,
                    limit: 0,
                    setLimit
                } as ListValue
            };
            const component = render(<Combobox {...lazyLoadingProps} />);

            expect(component.queryAllByRole("option")).toHaveLength(0);
            expect(lazyLoadingProps.optionsSourceAssociationDataSource?.limit).toEqual(0);

            const input = await getInput(component);
            fireEvent.click(input);

            await waitFor(() => {
                expect(component.queryAllByRole("option")).toHaveLength(4);
                expect(setLimit).toHaveBeenCalledWith(100);
            });
        });
    });
});
