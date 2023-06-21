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
        rerender({ initialFilterValue: "Fun", initialFilterType: "greater", updateFilters: callback });
        expect(callback).not.toBeCalled();
        rerender({ initialFilterValue: undefined, initialFilterType: "greater", updateFilters: callback });
        expect(callback).not.toBeCalled();
    });

    it("calls the updateFilters once on mount when initial value is given", () => {
        const initVal = "Magic";
        const initType = "smaller" as const;
        const callback = jest.fn();
        const { rerender } = renderHook(
            (props: Parameters<typeof useSetInitialConditionEffect>[0]) => useSetInitialConditionEffect(props),
            {
                initialProps: { initialFilterValue: initVal, initialFilterType: initType, updateFilters: callback }
            }
        );

        expect(callback).toHaveBeenCalledWith(initVal, initType);

        rerender({ initialFilterValue: initVal, initialFilterType: initType, updateFilters: callback });

        expect(callback).toBeCalledTimes(1);
    });
});
