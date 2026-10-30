import { act, renderHook } from "@testing-library/react";
import { Big } from "big.js";
import {
    actionValue,
    EditableValueBuilder,
    ReferenceSetValueBuilder,
    ReferenceValueBuilder
} from "@mendix/widget-plugin-test-utils";
import { ComboboxContainerProps } from "../../../typings/ComboboxProps";
import {
    associationMultiProps,
    associationSingleProps,
    enumerationProps,
    itemA,
    itemB,
    itemC,
    itemD,
    staticProps
} from "../../helpers/__tests__/fixtures";
import { useComboboxCore } from "../../hooks/useComboboxCore";
import { ComboboxCore } from "../ComboboxCore";
import { createComboboxContainer } from "../createComboboxContainer";
import { CB_TOKENS as CB } from "../tokens";

function createCore(props: ComboboxContainerProps): ComboboxCore {
    return createComboboxContainer(props).get(CB.core);
}

describe("ComboboxCore", () => {
    describe("single mode (enumeration)", () => {
        it("derives the envelope, flags and hints", () => {
            const vm = createCore(enumerationProps()).viewModel;

            expect(vm).toMatchObject({
                id: "comboBox1",
                tabIndex: 0,
                mode: "single",
                status: "ready",
                readOnly: false,
                validation: undefined,
                clearable: true,
                filterable: true,
                canSelectAll: false,
                allSelected: "none",
                chips: [],
                a11y: { label: undefined, required: false, describedBy: undefined },
                hints: {
                    readOnlyStyle: "bordered",
                    selectedItemsStyle: "text",
                    selectionMethod: "checkbox",
                    loadingType: "spinner",
                    customContent: "none"
                },
                loading: { lazy: false, isLoading: false, hasMore: false },
                slots: { menuFooter: undefined }
            });
        });

        it("lists the options with captions and marks the selected one", () => {
            const vm = createCore(enumerationProps()).viewModel;

            expect(vm.options.map(o => [o.id, o.caption, o.selected])).toEqual([
                ["red", "Formatted red", false],
                ["green", "Formatted green", true],
                ["blue", "Formatted blue", false]
            ]);
            expect(vm.value).toBe("green");
            expect(vm.selected).toMatchObject({ id: "green", caption: "Formatted green", selected: true });
        });

        it("has no selected option when the attribute is empty", () => {
            const attribute = new EditableValueBuilder<string>().withUniverse("red", "green").build();
            const vm = createCore(enumerationProps(attribute)).viewModel;

            expect(vm.value).toBeNull();
            expect(vm.selected).toBeNull();
            expect(vm.t("emptyOption")).toBe("Select...");
        });

        it("maps an unavailable selector to the unavailable status", () => {
            const attribute = new EditableValueBuilder<string>().isUnavailable().build();
            const vm = createCore(enumerationProps(attribute)).viewModel;

            expect(vm.status).toBe("unavailable");
        });

        it("translates texts and formats the parametrised ones", () => {
            const vm = createCore(enumerationProps()).viewModel;

            expect(vm.t("noOptions")).toBe("No options");
            expect(vm.t("clearSelection")).toBe("Clear");
            expect(vm.t("a11ySelectedValue", "green")).toBe("Selected value: green");
            expect(vm.t("a11yOptionsAvailable", 3)).toBe("Options available: 3");
            expect(vm.t("a11yNoOption")).toBe("No options");
        });

        it("points describedBy at the validation message when there is one", () => {
            const attribute = new EditableValueBuilder<string>().withUniverse("red").withValidation("Required").build();
            const vm = createCore(enumerationProps(attribute)).viewModel;

            expect(vm.validation).toBe("Required");
            expect(vm.a11y.describedBy).toBe("comboBox1-validation-message");
        });

        it("writes selection commands to the attribute", () => {
            const props = enumerationProps();
            const core = createCore(props);

            core.viewModel.select("red");
            expect(props.attributeEnumeration.setValue).toHaveBeenLastCalledWith("red");

            // The mock attribute keeps "green" selected, so toggling it deselects.
            core.viewModel.toggleItem("green");
            expect(props.attributeEnumeration.setValue).toHaveBeenLastCalledWith(undefined);

            core.viewModel.select("blue");
            core.viewModel.clear();
            expect(props.attributeEnumeration.setValue).toHaveBeenLastCalledWith(undefined);
        });

        it("filters the options when the input value changes", () => {
            const core = createCore(enumerationProps());

            core.viewModel.setInputValue("gree");

            expect(core.viewModel.options.map(o => o.id)).toEqual(["green"]);
        });

        it("runs the filter-input action with the typed text once the debounce elapses", () => {
            jest.useFakeTimers();
            const action = actionValue<NonNullable<ComboboxContainerProps["onChangeFilterInputEvent"]>>();
            const core = createCore(enumerationProps(undefined, { onChangeFilterInputEvent: action }));

            core.viewModel.setInputValue("re");
            expect(action.execute).not.toHaveBeenCalled();

            jest.advanceTimersByTime(200);
            expect(action.execute).toHaveBeenCalledWith({ filterInput: "re" });
            jest.useRealTimers();
        });
    });

    describe("multi mode (association)", () => {
        it("derives chips in the stored order and the select-all state", () => {
            const attr = new ReferenceSetValueBuilder().withValue([itemC, itemA]).build();
            const vm = createCore(associationMultiProps({ attr, selectAllButton: true })).viewModel;

            expect(vm.mode).toBe("multi");
            expect(vm.value).toEqual(["obj_c", "obj_a"]);
            expect(vm.chips.map(c => [c.id, c.caption])).toEqual([
                ["obj_c", "Cherry"],
                ["obj_a", "Apple"]
            ]);
            expect(vm.selected).toBeNull();
            expect(vm.canSelectAll).toBe(true);
            expect(vm.allSelected).toBe("some");
            expect(vm.options.map(o => [o.id, o.selected])).toEqual([
                ["obj_a", true],
                ["obj_b", false],
                ["obj_c", true],
                ["obj_d", false]
            ]);
        });

        it("joins the selected captions for the text style", () => {
            const attr = new ReferenceSetValueBuilder().withValue([itemA, itemB]).build();
            const vm = createCore(associationMultiProps({ attr })).viewModel;

            expect(vm.selectedContent).toBe("Apple, Banana");
        });

        it("adds, removes, toggles, clears and selects all through the association", () => {
            const attr = new ReferenceSetValueBuilder().withValue([itemA]).build();
            const core = createCore(associationMultiProps({ attr }));
            const vm = core.viewModel;

            vm.select("obj_b");
            expect(attr.setValue).toHaveBeenLastCalledWith([itemA, itemB]);

            vm.select("obj_a");
            expect(attr.setValue).toHaveBeenCalledTimes(1);

            vm.deselect("obj_a");
            expect(attr.setValue).toHaveBeenLastCalledWith([]);

            vm.toggleItem("obj_c");
            expect(attr.setValue).toHaveBeenLastCalledWith([itemA, itemC]);

            vm.selectAll();
            expect(attr.setValue).toHaveBeenLastCalledWith([itemA, itemB, itemC, itemD]);

            vm.clear();
            expect(attr.setValue).toHaveBeenLastCalledWith([]);
        });

        it("reports the forced boxes style as a hint", () => {
            const vm = createCore(
                associationMultiProps({ selectedItemsStyle: "text", optionsSourceAssociationCustomContentType: "yes" })
            ).viewModel;

            expect(vm.hints.selectedItemsStyle).toBe("boxes");
            expect(vm.hints.customContent).toBe("everywhere");
        });
    });

    describe("structural sharing", () => {
        it("keeps every slice and command reference while nothing changed", () => {
            const container = createComboboxContainer(enumerationProps());
            const core = container.get(CB.core);
            const before = core.viewModel;

            container.setProps(enumerationProps());
            const after = core.viewModel;

            expect(after).not.toBe(before);
            expect(after.hints).toBe(before.hints);
            expect(after.a11y).toBe(before.a11y);
            expect(after.loading).toBe(before.loading);
            expect(after.select).toBe(before.select);
            expect(after.t).toBe(before.t);
            expect(after.options.map(o => o.id)).toEqual(before.options.map(o => o.id));
        });

        it("rebuilds only the options that changed", () => {
            const container = createComboboxContainer(staticProps());
            const core = container.get(CB.core);
            const before = core.viewModel.options;

            container.setProps(
                staticProps(new EditableValueBuilder<string | Big | boolean | Date>().withValue("two").build())
            );
            const after = core.viewModel.options;

            expect(after.map(o => o.selected)).toEqual([false, true, false]);
            expect(after[0].caption).toBe("One");
            expect(after[1]).not.toBe(before[1]);
        });

        it("returns the cached ViewModel until an observable changes", () => {
            const core = createCore(enumerationProps());

            expect(core.viewModel).toBe(core.viewModel);

            core.viewModel.setInputValue("b");

            expect(core.viewModel.options.map(o => o.id)).toEqual(["blue"]);
        });
    });
});

describe("useComboboxCore", () => {
    it("keeps one core per host and re-renders once when the search term changes", () => {
        let renders = 0;
        const { result, rerender } = renderHook(
            (props: ComboboxContainerProps) => {
                renders++;
                return useComboboxCore(props);
            },
            { initialProps: enumerationProps() }
        );
        const core = result.current.core;

        rerender(enumerationProps());
        expect(result.current.core).toBe(core);
        const before = renders;

        act(() => {
            result.current.vm.setInputValue("gree");
        });

        expect(renders).toBe(before + 1);
        expect(result.current.vm.options.map(o => o.id)).toEqual(["green"]);
    });

    it("pushes the latest props into the selector once per render", () => {
        const { result, rerender } = renderHook((props: ComboboxContainerProps) => useComboboxCore(props), {
            initialProps: enumerationProps()
        });
        const updateProps = jest.spyOn(result.current.core.selector, "updateProps");
        const next = enumerationProps();

        rerender(next);

        expect(updateProps).toHaveBeenCalledTimes(1);
        expect(updateProps).toHaveBeenCalledWith(next);
    });

    it("reflects a props update in the same render without a render-phase update", () => {
        const error = jest.spyOn(console, "error").mockImplementation(() => {});
        const { result, rerender } = renderHook((props: ComboboxContainerProps) => useComboboxCore(props), {
            initialProps: associationSingleProps()
        });

        rerender(associationSingleProps({ attr: new ReferenceValueBuilder().withValue(itemB).build() }));

        expect(result.current.vm.value).toBe("obj_b");
        expect(error).not.toHaveBeenCalled();
        error.mockRestore();
    });
});
