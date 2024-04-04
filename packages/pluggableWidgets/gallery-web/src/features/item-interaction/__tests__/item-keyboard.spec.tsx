import { createElement, ReactElement } from "react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { render, RenderResult } from "@testing-library/react";
import { objectItems } from "@mendix/widget-plugin-test-utils";
import { EventEntryContext } from "../base";
import { createItemHandlers } from "../item-handlers";
import { createActionHandlers } from "../action-handlers";
import { eventSwitch } from "@mendix/widget-plugin-grid/event-switch/event-switch";
import { SelectionType } from "@mendix/widget-plugin-grid/selection";

function setup(jsx: ReactElement): { user: UserEvent } & RenderResult {
    return {
        user: userEvent.setup(),
        ...render(jsx)
    };
}

describe("gallery item", () => {
    describe("on shift+space event", () => {
        it("calls methods", async () => {
            const onSelect = jest.fn();
            const onExecuteAction = jest.fn();

            const [item] = objectItems(1);

            const props = eventSwitch<EventEntryContext, HTMLDivElement>(
                (): EventEntryContext => ({
                    item,
                    selectionType: "Single",
                    selectionMode: "clear",
                    clickTrigger: "single"
                }),
                [...createItemHandlers(onSelect, jest.fn(), jest.fn(), 1), ...createActionHandlers(onExecuteAction)]
            );

            const { user } = setup(<div role="listitem" tabIndex={1} {...props} />);
            await user.tab();
            await user.keyboard("{Shift>}[Space]{/Shift}");

            expect(onSelect).toHaveBeenCalledTimes(1);
            expect(onExecuteAction).toHaveBeenCalledTimes(0);
        });
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

                const props = eventSwitch<EventEntryContext, HTMLDivElement>(
                    (): EventEntryContext => ({
                        item,
                        selectionType: selectionType as SelectionType,
                        selectionMode: "clear",
                        clickTrigger: "single"
                    }),
                    [...createItemHandlers(jest.fn(), onSelectAll, jest.fn(), 1)]
                );

                const { user } = setup(<div role="listitem" tabIndex={1} {...props} />);
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
            {
                selectionType: "None",
                n: 0,
                key: "ArrowUp",
                params: [true, "clear", { direction: "backward", size: 1 }]
            },
            {
                selectionType: "Single",
                n: 0,
                key: "ArrowDown",
                params: [true, "clear", { direction: "forward", size: 1 }]
            },
            {
                selectionType: "Multi",
                n: 1,
                key: "ArrowUp",
                params: [true, "clear", { direction: "backward", size: 1 }]
            },
            {
                selectionType: "Multi",
                n: 1,
                key: "ArrowDown",
                params: [true, "clear", { direction: "forward", size: 1 }]
            },
            {
                selectionType: "Multi",
                n: 1,
                key: "ArrowLeft",
                params: [true, "clear", { direction: "backward", size: 1 }]
            },
            {
                selectionType: "Multi",
                n: 1,
                key: "ArrowRight",
                params: [true, "clear", { direction: "forward", size: 1 }]
            },
            {
                selectionType: "Multi",
                n: 1,
                key: "PageUp",
                params: [true, "clear", { code: "PageUp", numberOfColumns: 1 }]
            },
            {
                selectionType: "Multi",
                n: 1,
                key: "PageDown",
                params: [true, "clear", { code: "PageDown", numberOfColumns: 1 }]
            },
            {
                selectionType: "Multi",
                n: 1,
                key: "Home",
                params: [true, "clear", { code: "Home", numberOfColumns: 1 }]
            },
            {
                selectionType: "Multi",
                n: 1,
                key: "End",
                params: [true, "clear", { code: "End", numberOfColumns: 1 }]
            }
        ];

        test.each(cases)(
            "calls onSelectAdjacent $n time(s) when selection is $selectionType and key is $key",
            async ({ selectionType, n, key, params }) => {
                const onSelectAdjacent = jest.fn();

                const [item] = objectItems(1);

                const props = eventSwitch<EventEntryContext, HTMLDivElement>(
                    (): EventEntryContext => ({
                        item,
                        selectionType: selectionType as SelectionType,
                        selectionMode: "clear",
                        clickTrigger: "single"
                    }),
                    [...createItemHandlers(jest.fn(), jest.fn(), onSelectAdjacent, 1)]
                );

                const { user } = setup(<div role="listitem" tabIndex={1} {...props} />);
                await user.tab();
                await user.keyboard(`{Shift>}[${key}]{/Shift}`);

                expect(onSelectAdjacent).toHaveBeenCalledTimes(n);
                if (n > 0) {
                    expect(onSelectAdjacent).toHaveBeenLastCalledWith(item, ...params);
                }
            }
        );
    });

    describe("on keyup[Space|Enter] event", () => {
        const cases = [
            { n: 1, key: "Space" },
            { n: 1, key: "Enter" }
        ];

        test.each(cases)("calls onExecuteAction $n time(s) when key is $key", async ({ n, key }) => {
            const onExecuteAction = jest.fn();

            const [item] = objectItems(1);

            const props = eventSwitch<EventEntryContext, HTMLDivElement>(
                (): EventEntryContext => ({
                    item,
                    selectionType: "None",
                    selectionMode: "clear",
                    clickTrigger: "single"
                }),
                [...createActionHandlers(onExecuteAction)]
            );
            const { user } = setup(<div role="listitem" tabIndex={1} {...props} />);
            await user.tab();
            await user.keyboard(`[${key}]`);
            expect(onExecuteAction).toHaveBeenCalledTimes(n);
        });

        test("calls onExecuteAction only if keydown[Space] event was emitted earlier on the current target", async () => {
            const onExecuteAction = jest.fn();

            const [item] = objectItems(1);

            const props = eventSwitch<EventEntryContext, HTMLDivElement>(
                (): EventEntryContext => ({
                    item,
                    selectionType: "None",
                    selectionMode: "clear",
                    clickTrigger: "single"
                }),
                [...createActionHandlers(onExecuteAction)]
            );
            const { user } = setup(<div role="listitem" tabIndex={1} {...props} />);
            // start on document.body
            await user.keyboard(`[Space>]`);
            // move to focus to cell
            await user.tab();
            // release space key
            await user.keyboard(`[/Space]`);
            expect(onExecuteAction).toHaveBeenCalledTimes(0);
        });

        test("calls onExecuteAction only if keydown[Enter] event was emitted earlier on the current target", async () => {
            const onExecuteAction = jest.fn();

            const [item] = objectItems(1);

            const props = eventSwitch<EventEntryContext, HTMLDivElement>(
                (): EventEntryContext => ({
                    item,
                    selectionType: "None",
                    selectionMode: "clear",
                    clickTrigger: "single"
                }),
                [...createActionHandlers(onExecuteAction)]
            );
            const { user } = setup(<div role="listitem" tabIndex={1} {...props} />);
            // start on document.body
            await user.keyboard(`[Enter>]`);
            // move to focus to cell
            await user.tab();
            // release space enter
            await user.keyboard(`[/Enter]`);
            expect(onExecuteAction).toHaveBeenCalledTimes(0);
        });
    });

    describe("on keyup[Space] event", () => {
        const cases = [
            [1, "Single"],
            [1, "Multi"]
        ];
        test.each(cases)(
            "calls onExecuteAction %s time(s) when selection type is %s and selection method is %s and click trigger is %s",
            async (times: number, selectionType: SelectionType) => {
                const onExecuteAction = jest.fn();

                const [item] = objectItems(1);

                const props = eventSwitch<EventEntryContext, HTMLDivElement>(
                    (): EventEntryContext => ({
                        item,
                        selectionType,
                        selectionMode: "clear",
                        clickTrigger: "single"
                    }),
                    [...createActionHandlers(onExecuteAction)]
                );
                const { user } = setup(<div role="listitem" tabIndex={1} {...props} />);
                await user.tab();
                await user.keyboard(`[Space]`);
                expect(onExecuteAction).toHaveBeenCalledTimes(times);
            }
        );
    });

    describe("on keyup[Enter] event", () => {
        const cases = ["Single", "Multi", "None"];
        test.each(cases)(
            "calls onExecuteAction even when selection type is %s",
            async (selectionType: SelectionType) => {
                const onExecuteAction = jest.fn();

                const [item] = objectItems(1);

                const props = eventSwitch<EventEntryContext, HTMLDivElement>(
                    (): EventEntryContext => ({
                        item,
                        selectionType,
                        selectionMode: "clear",
                        clickTrigger: "single"
                    }),
                    [...createActionHandlers(onExecuteAction)]
                );
                const { user } = setup(<div role="listitem" tabIndex={1} {...props} />);
                await user.tab();
                await user.keyboard(`[Enter]`);
                expect(onExecuteAction).toHaveBeenCalledTimes(1);
            }
        );
    });
});
