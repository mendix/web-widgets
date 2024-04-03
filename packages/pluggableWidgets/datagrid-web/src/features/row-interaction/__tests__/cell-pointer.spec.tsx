import { createElement } from "react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { render, RenderResult } from "@testing-library/react";
import { createActionHandlers } from "../action-handlers";
import { createSelectHandlers } from "../select-handlers";
import { CellContext } from "../base";
import { objectItems } from "@mendix/widget-plugin-test-utils";
import { eventSwitch } from "@mendix/widget-plugin-grid/event-switch/event-switch";
import { SelectionMethod } from "../../../helpers/SelectActionHelper";
import { ClickTrigger } from "@mendix/widget-plugin-grid/helpers/ClickActionHelper";

function setup(jsx: React.ReactElement): { user: UserEvent } & RenderResult {
    return {
        user: userEvent.setup(),
        ...render(jsx)
    };
}

describe("grid cell", () => {
    describe("on click event", () => {
        const cases = [
            { ct: "single", sm: "rowClick", method: "none" },
            { ct: "double", sm: "rowClick", method: "onSelect" },
            { ct: "none", sm: "rowClick", method: "onSelect" },
            { ct: "single", sm: "checkbox", method: "onExecuteAction" },
            { ct: "double", sm: "checkbox", method: "none" },
            { ct: "none", sm: "checkbox", method: "none" },
            { ct: "single", sm: "none", method: "onExecuteAction" },
            { ct: "double", sm: "none", method: "none" },
            { ct: "none", sm: "none", method: "none" }
        ];

        test.each(cases)(
            "calls $method when selection method is $sm and click trigger is $ct",
            async ({ ct, sm, method }) => {
                const onExecuteAction = jest.fn();
                const onSelect = jest.fn();

                const [item] = objectItems(1);

                const props = eventSwitch<CellContext, HTMLDivElement>(
                    (): CellContext => ({
                        item,
                        pageSize: 10,
                        selectionMethod: sm as SelectionMethod,
                        selectionType: "Single",
                        selectionMode: "clear",
                        clickTrigger: ct as ClickTrigger
                    }),
                    [...createActionHandlers(onExecuteAction), ...createSelectHandlers(onSelect, jest.fn(), jest.fn())]
                );

                const { user, getByRole } = setup(<div role="gridcell" {...props} />);
                await user.click(getByRole("gridcell"));

                if (method === "none") {
                    expect(onExecuteAction).toHaveBeenCalledTimes(0);
                    expect(onSelect).toHaveBeenCalledTimes(0);
                } else if (method === "onSelect") {
                    expect(onExecuteAction).toHaveBeenCalledTimes(0);
                    expect(onSelect).toHaveBeenCalledTimes(1);
                } else {
                    expect(onExecuteAction).toHaveBeenCalledTimes(1);
                    expect(onSelect).toHaveBeenCalledTimes(0);
                }
            }
        );
    });

    describe("on shift+click event", () => {
        const cases = [
            { ct: "single", sm: "rowClick", method: "none" },
            { ct: "double", sm: "rowClick", method: "onSelect" },
            { ct: "none", sm: "rowClick", method: "onSelect" },
            { ct: "single", sm: "checkbox", method: "onExecuteAction" },
            { ct: "double", sm: "checkbox", method: "none" },
            { ct: "none", sm: "checkbox", method: "none" },
            { ct: "single", sm: "none", method: "onExecuteAction" },
            { ct: "double", sm: "none", method: "none" },
            { ct: "none", sm: "none", method: "none" }
        ];

        test.each(cases)(
            "calls $method when selection method is $sm and click trigger is $ct",
            async ({ ct, sm, method }) => {
                const onExecuteAction = jest.fn();
                const onSelect = jest.fn();

                const [item] = objectItems(1);

                const props = eventSwitch<CellContext, HTMLDivElement>(
                    (): CellContext => ({
                        item,
                        pageSize: 10,
                        selectionMethod: sm as SelectionMethod,
                        selectionType: "Single",
                        selectionMode: "clear",
                        clickTrigger: ct as ClickTrigger
                    }),
                    [...createActionHandlers(onExecuteAction), ...createSelectHandlers(onSelect, jest.fn(), jest.fn())]
                );

                const { user, getByRole } = setup(<div role="gridcell" {...props} />);
                await user.keyboard("{Shift>}");
                await user.click(getByRole("gridcell"));
                await user.keyboard("{/Shift}");

                if (method === "none") {
                    expect(onExecuteAction).toHaveBeenCalledTimes(0);
                    expect(onSelect).toHaveBeenCalledTimes(0);
                } else if (method === "onSelect") {
                    expect(onExecuteAction).toHaveBeenCalledTimes(0);
                    expect(onSelect).toHaveBeenCalledTimes(1);
                } else {
                    expect(onExecuteAction).toHaveBeenCalledTimes(1);
                    expect(onSelect).toHaveBeenCalledTimes(0);
                }
            }
        );
    });

    describe("on meta/ctrl+click event", () => {
        const cases = [
            { ct: "single", sm: "rowClick", method: "none" },
            { ct: "double", sm: "rowClick", method: "onSelect" },
            { ct: "none", sm: "rowClick", method: "onSelect" },
            { ct: "single", sm: "checkbox", method: "onSelect" },
            { ct: "double", sm: "checkbox", method: "onSelect" },
            { ct: "none", sm: "checkbox", method: "onSelect" },
            { ct: "single", sm: "none", method: "onExecuteAction" },
            { ct: "double", sm: "none", method: "none" },
            { ct: "none", sm: "none", method: "none" }
        ];

        test.each(cases)(
            "calls $method when selection method is $sm and click trigger is $ct",
            async ({ ct, sm, method }) => {
                const onExecuteAction = jest.fn();
                const onSelect = jest.fn();

                const [item] = objectItems(1);

                const props = eventSwitch<CellContext, HTMLDivElement>(
                    (): CellContext => ({
                        item,
                        pageSize: 10,
                        selectionMethod: sm as SelectionMethod,
                        selectionType: "Single",
                        selectionMode: "clear",
                        clickTrigger: ct as ClickTrigger
                    }),
                    [...createActionHandlers(onExecuteAction), ...createSelectHandlers(onSelect, jest.fn(), jest.fn())]
                );

                const { user, getByRole } = setup(<div role="gridcell" {...props} />);
                await user.keyboard("{Control>}");
                await user.click(getByRole("gridcell"));

                if (method === "none") {
                    expect(onExecuteAction).toHaveBeenCalledTimes(0);
                    expect(onSelect).toHaveBeenCalledTimes(0);
                } else if (method === "onSelect") {
                    expect(onExecuteAction).toHaveBeenCalledTimes(0);
                    expect(onSelect).toHaveBeenCalledTimes(1);
                } else {
                    expect(onExecuteAction).toHaveBeenCalledTimes(1);
                    expect(onSelect).toHaveBeenCalledTimes(0);
                }
            }
        );
    });

    describe("on dblclick event", () => {
        const cases = [
            { ct: "single", sm: "rowClick", n: 0 },
            { ct: "double", sm: "rowClick", n: 1 },
            { ct: "none", sm: "rowClick", n: 0 },
            { ct: "single", sm: "checkbox", n: 2 },
            { ct: "double", sm: "checkbox", n: 1 },
            { ct: "none", sm: "checkbox", n: 0 },
            { ct: "single", sm: "none", n: 2 },
            { ct: "double", sm: "none", n: 1 },
            { ct: "none", sm: "none", n: 0 }
        ];

        test.each(cases)(
            "calls onExecuteAction $n time(s) when selection method is $sm and click trigger is $ct",
            async ({ ct, sm, n }) => {
                const onExecuteAction = jest.fn();

                const [item] = objectItems(1);

                const props = eventSwitch<CellContext, HTMLDivElement>(
                    (): CellContext => ({
                        item,
                        pageSize: 10,
                        selectionMethod: sm as SelectionMethod,
                        selectionType: "Single",
                        selectionMode: "clear",
                        clickTrigger: ct as ClickTrigger
                    }),
                    [...createActionHandlers(onExecuteAction)]
                );

                const { user, getByRole } = setup(<div role="gridcell" {...props} />);
                await user.dblClick(getByRole("gridcell"));

                expect(onExecuteAction).toHaveBeenCalledTimes(n);
            }
        );
    });
});
