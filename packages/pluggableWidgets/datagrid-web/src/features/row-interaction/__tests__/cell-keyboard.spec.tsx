import { createElement } from "react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { render, renderHook, RenderResult } from "@testing-library/react";
import { objectItems } from "@mendix/widget-plugin-test-utils";
import { CellContext, ClickTrigger, SelectionMethod } from "../base";
import { createSelectHandlers } from "../select-handlers";
import { useEventSwitch } from "@mendix/widget-plugin-grid/event-switch/use-event-switch";
import { SelectionType } from "@mendix/widget-plugin-grid/selection";
import { createActionHandlers } from "../action-handlers";

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
                            pageSize: 10,
                            selectionMethod: sm as SelectionMethod,
                            selectionType: "Single",
                            clickTrigger: ct as ClickTrigger
                        }),
                        () => [...createSelectHandlers(onSelect, jest.fn(), jest.fn())]
                    )
                ).result.current;

                const { user } = setup(<div role="gridcell" tabIndex={1} {...props} />);
                await user.tab();
                await user.keyboard("{Shift>}[Space]{/Shift}");

                expect(onSelect).toHaveBeenCalledTimes(n);
                if (n > 0) {
                    expect(onSelect).toHaveBeenLastCalledWith(item, false);
                }
            }
        );
    });

    describe("on keydown{KeyA} event", () => {
        const cases = [
            { selectionType: "None", n: 0, prefix: "MetaLeft" },
            { selectionType: "Single", n: 0, prefix: "MetaLeft" },
            { selectionType: "Multi", n: 1, prefix: "MetaLeft" },
            { selectionType: "Multi", n: 1, prefix: "MetaRight" },
            { selectionType: "Multi", n: 1, prefix: "ControlLeft" },
            { selectionType: "Multi", n: 1, prefix: "ControlRight" }
        ];

        test.each(cases)(
            "calls onSelectAll $n time(s) when selection is $selectionType and key $prefix is pressed",
            async ({ selectionType, n, prefix }) => {
                const onSelectAll = jest.fn();

                const [item] = objectItems(1);

                const props = renderHook(() =>
                    useEventSwitch<CellContext, HTMLDivElement>(
                        (): CellContext => ({
                            item,
                            pageSize: 10,
                            selectionMethod: "rowClick",
                            selectionType: selectionType as SelectionType,
                            clickTrigger: "none"
                        }),
                        () => [...createSelectHandlers(jest.fn(), onSelectAll, jest.fn())]
                    )
                ).result.current;

                const { user } = setup(<div role="gridcell" tabIndex={1} {...props} />);
                await user.tab();
                await user.keyboard(`[${prefix}>]a[/${prefix}]`);

                expect(onSelectAll).toHaveBeenCalledTimes(n);
                if (n > 0) {
                    expect(onSelectAll).toHaveBeenLastCalledWith("selectAll");
                }
            }
        );
    });

    describe("on keydown event", () => {
        const cases = [
            { selectionType: "None", n: 0, key: "ArrowUp", params: [true, "backward", 1] },
            { selectionType: "Single", n: 0, key: "ArrowDown", params: [true, "forward", 1] },
            { selectionType: "Multi", n: 1, key: "ArrowUp", params: [true, "backward", 1] },
            { selectionType: "Multi", n: 1, key: "ArrowDown", params: [true, "forward", 1] },
            { selectionType: "Multi", n: 1, key: "PageUp", params: [true, "backward", 10] },
            { selectionType: "Multi", n: 1, key: "PageDown", params: [true, "forward", 10] },
            { selectionType: "Multi", n: 1, key: "Home", params: [true, "backward", "edge"] },
            { selectionType: "Multi", n: 1, key: "End", params: [true, "forward", "edge"] }
        ];

        test.each(cases)(
            "calls onSelectAdjacent $n time(s) when selection is $selectionType and key is $key",
            async ({ selectionType, n, key, params }) => {
                const onSelectAdjacent = jest.fn();

                const [item] = objectItems(1);

                const props = renderHook(() =>
                    useEventSwitch<CellContext, HTMLDivElement>(
                        (): CellContext => ({
                            item,
                            pageSize: 10,
                            selectionMethod: "rowClick",
                            selectionType: selectionType as SelectionType,
                            clickTrigger: "none"
                        }),
                        () => [...createSelectHandlers(jest.fn(), jest.fn(), onSelectAdjacent)]
                    )
                ).result.current;

                const { user } = setup(<div role="gridcell" tabIndex={1} {...props} />);
                await user.tab();
                await user.keyboard(`{Shift>}[${key}]{/Shift}`);

                expect(onSelectAdjacent).toHaveBeenCalledTimes(n);
                if (n > 0) {
                    expect(onSelectAdjacent).toHaveBeenLastCalledWith(item, ...params);
                }
            }
        );
    });

    describe("on keyup{Space|Enter} event", () => {
        const cases = [
            { ct: "single", n: 1, key: "Space" },
            { ct: "double", n: 1, key: "Space" },
            { ct: "none", n: 0, key: "Space" },
            { ct: "single", n: 1, key: "Enter" },
            { ct: "double", n: 1, key: "Enter" },
            { ct: "none", n: 0, key: "Enter" }
        ];

        test.each(cases)(
            "calls onExecuteAction $n time(s) when click trigger is $ct and key is $key",
            async ({ ct, n, key }) => {
                const onExecuteAction = jest.fn();

                const [item] = objectItems(1);

                const props = renderHook(() =>
                    useEventSwitch<CellContext, HTMLDivElement>(
                        (): CellContext => ({
                            item,
                            pageSize: 10,
                            selectionMethod: "none",
                            selectionType: "None",
                            clickTrigger: ct as ClickTrigger
                        }),
                        () => [...createActionHandlers(onExecuteAction)]
                    )
                ).result.current;

                const { user } = setup(<div role="gridcell" tabIndex={1} {...props} />);
                await user.tab();
                await user.keyboard(`[${key}]`);
                expect(onExecuteAction).toHaveBeenCalledTimes(n);
            }
        );
    });
});