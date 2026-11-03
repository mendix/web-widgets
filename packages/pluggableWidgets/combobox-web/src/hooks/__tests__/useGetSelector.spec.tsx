import { act, renderHook } from "@testing-library/react";
import { actionValue } from "@mendix/widget-plugin-test-utils";
import { ComboboxContainerProps } from "../../../typings/ComboboxProps";
import { enumerationProps } from "../../helpers/__tests__/fixtures";
import { Selector } from "../../helpers/types";
import { useGetSelector } from "../useGetSelector";

type FilterAction = NonNullable<ComboboxContainerProps["onChangeFilterInputEvent"]>;

function propsWithFilterAction(action: FilterAction, interval = 200): ComboboxContainerProps {
    return enumerationProps(undefined, {
        onChangeFilterInputEvent: action,
        filterInputDebounceInterval: interval
    });
}

describe("useGetSelector", () => {
    it("returns the same selector instance across re-renders", () => {
        const { result, rerender } = renderHook((props: ComboboxContainerProps) => useGetSelector(props), {
            initialProps: enumerationProps()
        });
        const first = result.current;

        rerender(enumerationProps());

        expect(result.current).toBe(first);
    });

    it("calls updateProps with the latest props on every render", () => {
        const { result, rerender } = renderHook((props: ComboboxContainerProps) => useGetSelector(props), {
            initialProps: enumerationProps()
        });
        const updateProps = jest.spyOn(result.current, "updateProps");
        const next = enumerationProps();

        rerender(next);

        expect(updateProps).toHaveBeenCalledTimes(1);
        expect(updateProps).toHaveBeenCalledWith(next);
    });

    it("re-renders the host when the search term changes", () => {
        let renders = 0;
        const { result } = renderHook(
            (props: ComboboxContainerProps) => {
                renders++;
                return useGetSelector(props);
            },
            { initialProps: enumerationProps() }
        );
        const before = renders;

        act(() => {
            result.current.options.setSearchTerm("gree");
        });

        expect(renders).toBe(before + 1);
        expect(result.current.options.getAll()).toEqual(["green"]);
    });

    it("attaches onFilterInputChange from the second render on", () => {
        // Quirk: the first render creates the selector, the next render wires the debounced callback.
        const { result, rerender } = renderHook((props: ComboboxContainerProps) => useGetSelector(props), {
            initialProps: enumerationProps()
        });
        expect(result.current.onFilterInputChange).toBeUndefined();

        rerender(enumerationProps());

        expect(result.current.onFilterInputChange).toEqual(expect.any(Function));
    });

    describe("filter-input action", () => {
        beforeEach(() => jest.useFakeTimers());
        afterEach(() => jest.useRealTimers());

        function renderAttached(action: FilterAction, interval?: number): Selector {
            const { result, rerender } = renderHook((props: ComboboxContainerProps) => useGetSelector(props), {
                initialProps: propsWithFilterAction(action, interval)
            });
            rerender(propsWithFilterAction(action, interval));
            return result.current;
        }

        it("debounces the action and sends the last term", () => {
            const action = actionValue<FilterAction>();
            const selector = renderAttached(action);

            selector.onFilterInputChange!("a");
            selector.onFilterInputChange!("ab");
            expect(action.execute).not.toHaveBeenCalled();

            jest.advanceTimersByTime(200);

            expect(action.execute).toHaveBeenCalledTimes(1);
            expect(action.execute).toHaveBeenCalledWith({ filterInput: "ab" });
        });

        it("respects the configured interval", () => {
            const action = actionValue<FilterAction>();
            const selector = renderAttached(action, 500);

            selector.onFilterInputChange!("a");
            jest.advanceTimersByTime(200);
            expect(action.execute).not.toHaveBeenCalled();

            jest.advanceTimersByTime(300);
            expect(action.execute).toHaveBeenCalledTimes(1);
        });

        it("sends undefined for an empty term", () => {
            const action = actionValue<FilterAction>();
            const selector = renderAttached(action);

            selector.onFilterInputChange!("");
            jest.advanceTimersByTime(200);

            expect(action.execute).toHaveBeenCalledWith({ filterInput: undefined });
        });

        it("skips the action when it cannot execute or is already executing", () => {
            const cannot = actionValue<FilterAction>(false);
            renderAttached(cannot).onFilterInputChange!("a");
            jest.advanceTimersByTime(200);
            expect(cannot.execute).not.toHaveBeenCalled();

            const executing = actionValue<FilterAction>(true, true);
            renderAttached(executing).onFilterInputChange!("a");
            jest.advanceTimersByTime(200);
            expect(executing.execute).not.toHaveBeenCalled();
        });
    });
});
