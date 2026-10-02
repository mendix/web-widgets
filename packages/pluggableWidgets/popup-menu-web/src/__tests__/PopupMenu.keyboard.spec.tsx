import { act, render, RenderResult, screen, waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { ActionValue } from "mendix";
import { KeyboardEvent, ReactElement, ReactNode } from "react";
import { actionValue, dynamic } from "@mendix/widget-plugin-test-utils";
import { BasicItemsType, PopupMenuContainerProps } from "../../typings/PopupMenuProps";
import { PopupMenu } from "../components/PopupMenu";

import "@testing-library/jest-dom";

/** Behaves like a Mendix Action Button without action: prevents default on Enter/Space but propagates. */
function PreventDefaultButton({ children }: { children: ReactNode }): ReactElement {
    return (
        <button
            onKeyDown={(e: KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                }
            }}
        >
            {children}
        </button>
    );
}

function basicItem(caption: string, action?: ActionValue): BasicItemsType {
    return { itemType: "item", caption: dynamic.available(caption), styleClass: "defaultStyle", action };
}

const divider: BasicItemsType = { itemType: "divider", styleClass: "defaultStyle" };

function props(overrides: Partial<PopupMenuContainerProps> = {}): PopupMenuContainerProps {
    return {
        name: "popup-menu",
        class: "mx-popup-menu",
        trigger: "onclick",
        menuToggle: false,
        menuTrigger: <PreventDefaultButton>Trigger</PreventDefaultButton>,
        advancedMode: false,
        position: "bottom",
        hoverCloseOn: "onClickOutside",
        clickCloseOn: "onClickAnywhere",
        basicItems: [basicItem("One"), basicItem("Two"), basicItem("Three")],
        customItems: [],
        clippingStrategy: "absolute",
        ...overrides
    };
}

function renderPage(menu: PopupMenuContainerProps): RenderResult {
    return render(
        <div>
            <PopupMenu {...menu} />
            <button>After</button>
        </div>
    );
}

const trigger = (): HTMLElement => screen.getByRole("button", { name: "Trigger" });
const item = (name: string): HTMLElement => screen.getByRole("menuitem", { name });
const queryMenu = (): HTMLElement | null => screen.queryByRole("menu");

async function openWith(user: UserEvent, key: string): Promise<void> {
    trigger().focus();
    await user.keyboard(key);
    await waitFor(() => expect(queryMenu()).toBeInTheDocument());
}

describe("Popup Menu keyboard interaction", () => {
    let user: UserEvent;

    beforeEach(() => {
        user = userEvent.setup();
    });

    describe("trigger", () => {
        it.each([
            ["Enter", "{Enter}"],
            ["Space", " "],
            ["Arrow Down", "{ArrowDown}"]
        ])("opens with %s on content that prevents default and focuses the first item", async (_, key) => {
            renderPage(props());

            await openWith(user, key);

            await waitFor(() => expect(item("One")).toHaveFocus());
        });

        it("opens with Arrow Up and focuses the last item", async () => {
            renderPage(props());

            await openWith(user, "{ArrowUp}");

            await waitFor(() => expect(item("Three")).toHaveFocus());
        });

        it.each([
            ["Enter", "{Enter}"],
            ["Space", " "]
        ])("opens exactly once with %s on a native button", async (_, key) => {
            renderPage(props({ menuTrigger: <button>Trigger</button> }));

            await openWith(user, key);

            await waitFor(() => expect(item("One")).toHaveFocus());
            expect(queryMenu()).toBeInTheDocument();
        });

        it("skips a leading divider for initial focus", async () => {
            renderPage(props({ basicItems: [divider, basicItem("One"), basicItem("Two")] }));

            await openWith(user, "{ArrowDown}");

            await waitFor(() => expect(item("One")).toHaveFocus());
        });

        it.each([
            ["Enter", "{Enter}"],
            ["Space", " "],
            ["Arrow Down", "{ArrowDown}"]
        ])("opens in hover mode with %s", async (_, key) => {
            renderPage(props({ trigger: "onhover" }));

            await openWith(user, key);

            await waitFor(() => expect(item("One")).toHaveFocus());
        });

        it("closes with Enter when the menu is open and focus is on the trigger", async () => {
            renderPage(props({ menuToggle: true }));
            trigger().focus();

            await user.keyboard("{Enter}");

            expect(queryMenu()).not.toBeInTheDocument();
            expect(trigger()).toHaveFocus();
        });

        it("focuses the first item when opened by click", async () => {
            renderPage(props());

            await user.click(trigger());

            await waitFor(() => expect(item("One")).toHaveFocus());
        });

        it("closes when the trigger is clicked again while focus is in the menu", async () => {
            renderPage(props());
            await user.click(trigger());
            await waitFor(() => expect(item("One")).toHaveFocus());

            await user.click(trigger());

            expect(queryMenu()).not.toBeInTheDocument();
        });

        it("doesn't move focus when opened by hover, and Tab enters the menu", async () => {
            renderPage(props({ trigger: "onhover" }));
            trigger().focus();

            await user.hover(trigger());
            await waitFor(() => expect(queryMenu()).toBeInTheDocument());
            expect(trigger()).toHaveFocus();

            await user.tab();
            expect(item("One")).toHaveFocus();
        });

        it("exposes popup state on the trigger wrapper", async () => {
            const { container } = renderPage(props());
            const wrapper = container.querySelector(".popupmenu-trigger")!;

            expect(wrapper).toHaveAttribute("aria-haspopup", "menu");
            expect(wrapper).toHaveAttribute("aria-expanded", "false");
            expect(trigger()).not.toHaveAttribute("aria-haspopup");

            await openWith(user, "{Enter}");

            expect(wrapper).toHaveAttribute("aria-expanded", "true");
            expect(wrapper).toHaveAttribute("aria-controls", queryMenu()!.id);
            expect(queryMenu()).toHaveAttribute("aria-labelledby", wrapper.id);
        });
    });

    describe("Escape", () => {
        it("closes the menu from an item and returns focus to the trigger", async () => {
            renderPage(props());
            await openWith(user, "{Enter}");
            await waitFor(() => expect(item("One")).toHaveFocus());

            await user.keyboard("{Escape}");

            expect(queryMenu()).not.toBeInTheDocument();
            await waitFor(() => expect(trigger()).toHaveFocus());
        });

        it("closes the menu from the trigger and keeps focus there", async () => {
            renderPage(props({ menuToggle: true }));
            trigger().focus();

            await user.keyboard("{Escape}");

            expect(queryMenu()).not.toBeInTheDocument();
            expect(trigger()).toHaveFocus();
        });

        it("is ignored when focus is outside the widget", async () => {
            renderPage(props({ menuToggle: true }));
            const after = screen.getByRole("button", { name: "After" });
            after.focus();

            await user.keyboard("{Escape}");

            expect(queryMenu()).toBeInTheDocument();
            expect(after).toHaveFocus();
        });

        it("doesn't propagate to an outer Escape handler", async () => {
            const outerHandler = jest.fn();
            render(
                <div onKeyDown={e => e.key === "Escape" && outerHandler()}>
                    <PopupMenu {...props()} />
                </div>
            );
            await openWith(user, "{Enter}");
            await waitFor(() => expect(item("One")).toHaveFocus());

            await user.keyboard("{Escape}");

            expect(outerHandler).not.toHaveBeenCalled();
        });
    });

    describe("Tab", () => {
        it("doesn't intercept Tab: it closes the menu once focus lands past the widget", async () => {
            renderPage(props());
            await openWith(user, "{Enter}");
            await waitFor(() => expect(item("One")).toHaveFocus());

            await user.tab();

            const after = screen.getByRole("button", { name: "After" });
            expect(after).toHaveFocus();
            await waitFor(() => expect(queryMenu()).not.toBeInTheDocument());
        });

        it("can reach a focusable descendant inside custom item content, without closing", async () => {
            // Not managed by the menu (custom content is a black box), but not blocked either:
            // native Tab order still reaches it, since we don't touch its tabIndex.
            renderPage(
                props({
                    advancedMode: true,
                    customItems: [{ content: <button>Inner</button> }, { content: "Second" }]
                })
            );
            await openWith(user, "{Enter}");
            const [first] = screen.getAllByRole("menuitem");
            await waitFor(() => expect(first).toHaveFocus());

            await user.tab();

            expect(screen.getByRole("button", { name: "Inner" })).toHaveFocus();
            expect(queryMenu()).toBeInTheDocument();
        });

        it("doesn't close the menu when focus moves within it (arrow navigation)", async () => {
            renderPage(props());
            await openWith(user, "{Enter}");
            await waitFor(() => expect(item("One")).toHaveFocus());

            await user.keyboard("{ArrowDown}");

            await waitFor(() => expect(item("Two")).toHaveFocus());
            expect(queryMenu()).toBeInTheDocument();
        });

        it("closes the menu and returns focus to the trigger with Shift+Tab", async () => {
            renderPage(props());
            await openWith(user, "{Enter}");
            await waitFor(() => expect(item("One")).toHaveFocus());

            await user.tab({ shift: true });

            expect(trigger()).toHaveFocus();
            await waitFor(() => expect(queryMenu()).not.toBeInTheDocument());
        });

        it("closes the menu when something else (e.g. a dialog) steals focus, even without Tab", async () => {
            renderPage(props());
            await openWith(user, "{Enter}");
            await waitFor(() => expect(item("One")).toHaveFocus());
            const after = screen.getByRole("button", { name: "After" });

            act(() => after.focus());

            await waitFor(() => expect(queryMenu()).not.toBeInTheDocument());
        });
    });

    describe("items", () => {
        it("uses menu semantics with a single tab stop", () => {
            renderPage(props({ menuToggle: true, basicItems: [basicItem("One"), divider, basicItem("Two")] }));

            expect(queryMenu()).toBeInTheDocument();
            expect(screen.getAllByRole("menuitem")).toHaveLength(2);
            expect(screen.getByRole("separator")).not.toHaveAttribute("tabindex");
            expect(item("One")).toHaveAttribute("tabindex", "0");
            expect(item("Two")).toHaveAttribute("tabindex", "-1");
        });

        it("uses menuitem role for custom items", () => {
            renderPage(
                props({ menuToggle: true, advancedMode: true, customItems: [{ content: "A" }, { content: "B" }] })
            );

            expect(screen.getAllByRole("menuitem")).toHaveLength(2);
        });

        it("navigates with arrows, wraps, skips dividers and supports Home/End", async () => {
            renderPage(props({ basicItems: [basicItem("One"), divider, basicItem("Two"), basicItem("Three")] }));
            await openWith(user, "{ArrowDown}");
            await waitFor(() => expect(item("One")).toHaveFocus());

            await user.keyboard("{ArrowDown}");
            await waitFor(() => expect(item("Two")).toHaveFocus());
            expect(item("Two")).toHaveAttribute("tabindex", "0");
            expect(item("One")).toHaveAttribute("tabindex", "-1");

            await user.keyboard("{ArrowDown}{ArrowDown}");
            await waitFor(() => expect(item("One")).toHaveFocus());

            await user.keyboard("{ArrowUp}");
            await waitFor(() => expect(item("Three")).toHaveFocus());

            await user.keyboard("{Home}");
            await waitFor(() => expect(item("One")).toHaveFocus());

            await user.keyboard("{End}");
            await waitFor(() => expect(item("Three")).toHaveFocus());
        });

        it.each([
            ["Enter", "{Enter}"],
            ["Space", " "]
        ])("activates a basic item with %s", async (_, key) => {
            const action = actionValue();
            renderPage(props({ basicItems: [basicItem("One", action)] }));
            await openWith(user, "{ArrowDown}");
            await waitFor(() => expect(item("One")).toHaveFocus());

            await user.keyboard(key);

            expect(action.execute).toHaveBeenCalledTimes(1);
            expect(queryMenu()).not.toBeInTheDocument();
            await waitFor(() => expect(trigger()).toHaveFocus());
        });

        it("activates a custom item's widget-level action", async () => {
            const action = actionValue();
            renderPage(props({ advancedMode: true, customItems: [{ content: "Custom", action }] }));
            await openWith(user, "{ArrowDown}");
            await waitFor(() => expect(item("Custom")).toHaveFocus());

            await user.keyboard("{Enter}");

            expect(action.execute).toHaveBeenCalledTimes(1);
        });

        it("doesn't activate content inside a custom item without widget-level action", async () => {
            const innerClick = jest.fn();
            renderPage(
                props({
                    advancedMode: true,
                    customItems: [{ content: <button onClick={innerClick}>Inner</button> }]
                })
            );
            await openWith(user, "{ArrowDown}");
            const [custom] = screen.getAllByRole("menuitem");
            await waitFor(() => expect(custom).toHaveFocus());

            await user.keyboard("{Enter}");

            expect(innerClick).not.toHaveBeenCalled();
            expect(queryMenu()).not.toBeInTheDocument();
        });

        it("keeps the menu open and focus on the item with Close on: Click outside", async () => {
            const action = actionValue();
            renderPage(props({ clickCloseOn: "onClickOutside", basicItems: [basicItem("One", action)] }));
            await openWith(user, "{ArrowDown}");
            await waitFor(() => expect(item("One")).toHaveFocus());

            await user.keyboard("{Enter}");

            expect(action.execute).toHaveBeenCalledTimes(1);
            expect(queryMenu()).toBeInTheDocument();
            expect(item("One")).toHaveFocus();
        });

        it("closes the menu with Close on: Click outside if the action steals focus (e.g. opens a dialog)", async () => {
            const action = actionValue();
            renderPage(props({ clickCloseOn: "onClickOutside", basicItems: [basicItem("One", action)] }));
            const after = screen.getByRole("button", { name: "After" });
            (action.execute as jest.Mock).mockImplementation(() => after.focus());
            await openWith(user, "{ArrowDown}");
            await waitFor(() => expect(item("One")).toHaveFocus());

            await user.keyboard("{Enter}");

            expect(action.execute).toHaveBeenCalledTimes(1);
            await waitFor(() => expect(queryMenu()).not.toBeInTheDocument());
        });

        it("closes the menu on a mouse click with Close on: Click outside if the action steals focus", async () => {
            const action = actionValue();
            renderPage(
                props({ menuToggle: true, clickCloseOn: "onClickOutside", basicItems: [basicItem("One", action)] })
            );
            const after = screen.getByRole("button", { name: "After" });
            (action.execute as jest.Mock).mockImplementation(() => after.focus());

            await user.click(item("One"));

            expect(action.execute).toHaveBeenCalledTimes(1);
            await waitFor(() => expect(queryMenu()).not.toBeInTheDocument());
        });

        it("still activates an item with a mouse click", async () => {
            const action = actionValue();
            renderPage(props({ menuToggle: true, basicItems: [basicItem("One", action)] }));

            await user.click(item("One"));

            expect(action.execute).toHaveBeenCalledTimes(1);
            expect(queryMenu()).not.toBeInTheDocument();
        });
    });

    describe("submenus", () => {
        const leafAction = actionValue();

        function nested(name: string, trigger: PopupMenuContainerProps["trigger"] = "onclick"): ReactElement {
            return (
                <PopupMenu
                    {...props({
                        trigger,
                        menuTrigger: <span>{name}</span>,
                        basicItems: [basicItem(`${name} 1`, leafAction), basicItem(`${name} 2`)]
                    })}
                />
            );
        }

        function renderNested(): RenderResult {
            return renderPage(
                props({
                    advancedMode: true,
                    customItems: [
                        { content: nested("Alpha") },
                        { content: nested("Beta", "onhover") },
                        { content: "Leaf" }
                    ]
                })
            );
        }

        const parents = (): HTMLElement[] =>
            screen.getAllByRole("menuitem").filter(el => el.matches(".popupmenu-custom-item"));

        async function openRoot(): Promise<HTMLElement[]> {
            await openWith(user, "{ArrowDown}");
            const [alpha, beta, leaf] = parents();
            await waitFor(() => expect(alpha).toHaveFocus());
            return [alpha, beta, leaf];
        }

        beforeEach(() => {
            (leafAction.execute as jest.Mock).mockClear();
        });

        it("exposes the submenu on the parent item", async () => {
            renderNested();
            const [alpha, , leaf] = await openRoot();

            expect(alpha).toHaveAttribute("aria-haspopup", "menu");
            expect(alpha).toHaveAttribute("aria-expanded", "false");
            expect(leaf).not.toHaveAttribute("aria-haspopup");

            await user.keyboard("{ArrowRight}");

            await waitFor(() => expect(alpha).toHaveAttribute("aria-expanded", "true"));
        });

        it.each([
            ["Right Arrow", "{ArrowRight}", "Alpha", 0],
            ["Enter", "{Enter}", "Alpha", 0],
            ["Right Arrow in hover mode", "{ArrowRight}", "Beta", 1]
        ])("opens the submenu with %s and focuses its first item", async (_, key, name, parentIndex) => {
            renderNested();
            await openRoot();
            for (let i = 0; i < parentIndex; i++) {
                await user.keyboard("{ArrowDown}");
            }
            await waitFor(() => expect(parents()[parentIndex]).toHaveFocus());

            await user.keyboard(key);

            await waitFor(() => expect(item(`${name} 1`)).toHaveFocus());
        });

        it("does nothing on Right Arrow for a leaf item and Left Arrow at the top level", async () => {
            renderNested();
            const [, , leaf] = await openRoot();
            await user.keyboard("{End}");
            await waitFor(() => expect(leaf).toHaveFocus());

            await user.keyboard("{ArrowRight}{ArrowLeft}");

            expect(leaf).toHaveFocus();
            expect(screen.getAllByRole("menu")).toHaveLength(1);
        });

        it("navigates only within the submenu", async () => {
            renderNested();
            const [alpha] = await openRoot();
            await user.keyboard("{ArrowRight}");
            await waitFor(() => expect(item("Alpha 1")).toHaveFocus());

            await user.keyboard("{ArrowDown}{ArrowDown}");

            await waitFor(() => expect(item("Alpha 1")).toHaveFocus());
            expect(alpha).toHaveAttribute("tabindex", "0");
        });

        it.each([
            ["Left Arrow", "{ArrowLeft}"],
            ["Escape", "{Escape}"]
        ])("closes the submenu with %s and focuses the parent item", async (_, key) => {
            renderNested();
            const [alpha] = await openRoot();
            await user.keyboard("{ArrowRight}");
            await waitFor(() => expect(item("Alpha 1")).toHaveFocus());

            await user.keyboard(key);

            await waitFor(() => expect(alpha).toHaveFocus());
            expect(screen.getAllByRole("menu")).toHaveLength(1);
        });

        it("closes a sibling submenu when another one opens", async () => {
            renderNested();
            const [, beta] = await openRoot();
            await user.click(screen.getByText("Alpha"));
            await waitFor(() => expect(item("Alpha 1")).toBeInTheDocument());

            act(() => beta.focus());
            await user.keyboard("{ArrowRight}");

            await waitFor(() => expect(item("Beta 1")).toHaveFocus());
            expect(screen.queryByRole("menuitem", { name: "Alpha 1" })).not.toBeInTheDocument();
        });

        it("closes the whole hierarchy when a leaf is activated and focuses the root trigger", async () => {
            renderNested();
            await openRoot();
            await user.keyboard("{ArrowRight}");
            await waitFor(() => expect(item("Alpha 1")).toHaveFocus());

            await user.keyboard("{Enter}");

            expect(leafAction.execute).toHaveBeenCalledTimes(1);
            expect(queryMenu()).not.toBeInTheDocument();
            await waitFor(() => expect(trigger()).toHaveFocus());
        });

        it("closes the whole hierarchy with Tab", async () => {
            renderNested();
            await openRoot();
            await user.keyboard("{ArrowRight}");
            await waitFor(() => expect(item("Alpha 1")).toHaveFocus());

            await user.tab();

            const after = screen.getByRole("button", { name: "After" });
            expect(after).toHaveFocus();
            await waitFor(() => expect(queryMenu()).not.toBeInTheDocument());
        });

        it("closes the whole hierarchy with Shift+Tab and focuses the root trigger", async () => {
            renderNested();
            await openRoot();
            await user.keyboard("{ArrowRight}");
            await waitFor(() => expect(item("Alpha 1")).toHaveFocus());

            await user.tab({ shift: true });

            await waitFor(() => expect(queryMenu()).not.toBeInTheDocument());
            await waitFor(() => expect(trigger()).toHaveFocus());
        });

        it("closes the whole hierarchy with Shift+Tab onto a focusable submenu trigger", async () => {
            renderPage(
                props({
                    advancedMode: true,
                    customItems: [
                        {
                            content: (
                                <PopupMenu
                                    {...props({
                                        menuTrigger: <button>Gamma</button>,
                                        basicItems: [basicItem("Gamma 1")]
                                    })}
                                />
                            )
                        }
                    ]
                })
            );
            await openWith(user, "{ArrowDown}");
            await waitFor(() => expect(parents()[0]).toHaveFocus());
            await user.keyboard("{ArrowRight}");
            await waitFor(() => expect(item("Gamma 1")).toHaveFocus());

            await user.tab({ shift: true });

            await waitFor(() => expect(queryMenu()).not.toBeInTheDocument());
            await waitFor(() => expect(trigger()).toHaveFocus());
        });

        it("still toggles a submenu closed by clicking its trigger while focus is in it", async () => {
            renderPage(
                props({
                    advancedMode: true,
                    clickCloseOn: "onClickOutside",
                    customItems: [{ content: nested("Alpha") }]
                })
            );
            await openWith(user, "{ArrowDown}");
            await waitFor(() => expect(parents()[0]).toHaveFocus());
            await user.keyboard("{ArrowRight}");
            await waitFor(() => expect(item("Alpha 1")).toHaveFocus());

            await user.click(screen.getByText("Alpha"));

            expect(screen.queryByRole("menuitem", { name: "Alpha 1" })).not.toBeInTheDocument();
            expect(queryMenu()).toBeInTheDocument();
        });
    });
});
