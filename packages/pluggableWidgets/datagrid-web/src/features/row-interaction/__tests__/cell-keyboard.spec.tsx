import { createElement } from "react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { render, renderHook, RenderResult } from "@testing-library/react";
import { objectItems } from "@mendix/widget-plugin-test-utils";
import { CellContext, ClickTrigger, SelectionMethod } from "../base";
import { createSelectHandlers } from "../select-handlers";
import { useEventSwitch } from "@mendix/widget-plugin-grid/event-switch/use-event-switch";

function setup(jsx: React.ReactElement): { user: UserEvent } & RenderResult {
    return {
        user: userEvent.setup(),
        ...render(jsx)
    };
}

describe("grid cell", () => {
    describe("on shift+space event", () => {
        const cases = [
            { ct: "single", sm: "rowClick", n: 1 },
            { ct: "double", sm: "rowClick", n: 1 },
            { ct: "none", sm: "rowClick", n: 1 },
            { ct: "single", sm: "checkbox", n: 1 },
            { ct: "double", sm: "checkbox", n: 1 },
            { ct: "none", sm: "checkbox", n: 1 },
            { ct: "single", sm: "none", n: 0 },
            { ct: "double", sm: "none", n: 0 },
            { ct: "none", sm: "none", n: 0 }
        ];

        test.each(cases)(
            "calls onSelect $n time(s) when selection method is $sm and click trigger is $ct",
            async ({ ct, sm, n }) => {
                const onSelect = jest.fn();

                const [item] = objectItems(1);

                const props = renderHook(() =>
                    useEventSwitch<CellContext, HTMLDivElement>(
                        (): CellContext => ({
                            item,
                            selectionMethod: sm as SelectionMethod,
                            clickTrigger: ct as ClickTrigger
                        }),
                        () => [...createSelectHandlers(onSelect)]
                    )
                ).result.current;

                const { user } = setup(<div role="gridcell" {...props} />);
                await user.keyboard("{Shift>}{Space}{/Shift}");

                expect(onSelect).toHaveBeenCalledTimes(n);
                if (n > 0) {
                    expect(onSelect).toHaveBeenLastCalledWith(item, false);
                }
            }
        );
    });
});
