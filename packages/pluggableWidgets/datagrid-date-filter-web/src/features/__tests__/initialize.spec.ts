import { renderHook } from "@testing-library/react";
import { useSetInitialConditionEffect } from "../initialize";

describe("useSetInitialConditionEffect", () => {
    it("do not call updateFilters on mount when initial value is undefined", () => {
        const callback = jest.fn();
        renderHook((props: Parameters<typeof useSetInitialConditionEffect>[0]) => useSetInitialConditionEffect(props), {
            initialProps: { initialFilterValue: undefined, initialFilterType: "smaller", updateFilters: callback }
        });
        expect(callback).not.toBeCalled();
    });

    it("do not call updateFilters when the init value or type is changes", () => {
        const callback = jest.fn();
        const { rerender } = renderHook(
            (props: Parameters<typeof useSetInitialConditionEffect>[0]) => useSetInitialConditionEffect(props),
            {
                initialProps: { initialFilterValue: undefined, initialFilterType: "smaller", updateFilters: callback }
            }
        );
        expect(callback).not.toBeCalled();
        rerender({ initialFilterValue: new Date(), initialFilterType: "greater", updateFilters: callback });
        expect(callback).not.toBeCalled();
        rerender({ initialFilterValue: undefined, initialFilterType: "greater", updateFilters: callback });
        expect(callback).not.toBeCalled();
    });

    it("calls the updateFilters once on mount when initial value is Date", () => {
        const initVal = new Date();
        const initType = "smaller" as const;
        const callback = jest.fn();
        const { rerender } = renderHook(
            (props: Parameters<typeof useSetInitialConditionEffect>[0]) => useSetInitialConditionEffect(props),
            {
                initialProps: { initialFilterValue: initVal, initialFilterType: initType, updateFilters: callback }
            }
        );

        expect(callback).toHaveBeenCalledWith(initVal, [undefined, undefined], initType);

        rerender({ initialFilterValue: initVal, initialFilterType: initType, updateFilters: callback });

        expect(callback).toBeCalledTimes(1);
    });

    it("calls the updateFilters once on mount when initial value is date range", () => {
        const initVal = [new Date("2023-01-01"), new Date("2024-01-10")] as [Date | undefined, Date | undefined];
        const initType = "between" as const;
        const callback = jest.fn();
        const { rerender } = renderHook(
            (props: Parameters<typeof useSetInitialConditionEffect>[0]) => useSetInitialConditionEffect(props),
            {
                initialProps: { initialFilterValue: initVal, initialFilterType: initType, updateFilters: callback }
            }
        );

        expect(callback).toHaveBeenCalledWith(undefined, initVal, initType);

        rerender({ initialFilterValue: initVal, initialFilterType: initType, updateFilters: callback });

        expect(callback).toBeCalledTimes(1);
    });
});
