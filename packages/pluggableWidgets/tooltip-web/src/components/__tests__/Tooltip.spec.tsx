import { act, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import userEvent from "@testing-library/user-event";
import { ReactElement } from "react";
import { Tooltip, TooltipProps } from "../Tooltip";

jest.useFakeTimers();

describe("Tooltip", () => {
    let defaultTooltipProps: TooltipProps;

    beforeEach(() => {
        defaultTooltipProps = {
            htmlMessage: undefined,
            textMessage: "Tooltip text",
            position: "right",
            openOn: "click",
            trigger: (
                <div tabIndex={0} data-testid="tooltip-trigger">
                    Trigger
                </div>
            ),
            renderMethod: "text",
            name: "tooltip"
        };
    });

    it("render DOM structure", async () => {
        const { asFragment } = render(<Tooltip {...defaultTooltipProps} />);
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        const triggerElement = screen.getByTestId("tooltip-trigger");

        await user.click(triggerElement);

        expect(asFragment()).toMatchSnapshot();
    });

    it("opens tooltip onMouseEnter and close onMouseLeave", async () => {
        render(<Tooltip {...defaultTooltipProps} openOn="hover" />);
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        const triggerElement = screen.getByTestId("tooltip-trigger");

        // hover
        await user.hover(triggerElement);
        act(() => {
            jest.advanceTimersByTime(100);
        });
        expect(screen.queryByRole("tooltip")).toBeInTheDocument();

        // unhover
        await user.unhover(triggerElement);
        expect(screen.queryByRole("tooltip")).toBeNull();

        // focus: Hover opens on mouse hover only
        await user.keyboard("{Tab}");
        expect(triggerElement).toEqual(document.activeElement);
        expect(screen.queryByRole("tooltip")).toBeNull();

        // blur
        await user.keyboard("{Tab}");
        expect(triggerElement).not.toEqual(document.activeElement);
        expect(screen.queryByRole("tooltip")).toBeNull();
    });

    describe("keyboard focus in Hover,focus mode", () => {
        const buttonTrigger = <button type="button">Trigger button</button>;

        it("opens on focus and closes on blur", async () => {
            render(<Tooltip {...defaultTooltipProps} openOn="hoverFocus" trigger={buttonTrigger} />);
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            const button = screen.getByRole("button", { name: "Trigger button" });

            await user.keyboard("{Tab}");
            expect(button).toHaveFocus();
            expect(screen.queryByRole("tooltip")).toBeInTheDocument();

            await user.keyboard("{Tab}");
            expect(button).not.toHaveFocus();
            expect(screen.queryByRole("tooltip")).toBeNull();
        });

        it("stays open while the user types in a text box", async () => {
            render(<Tooltip {...defaultTooltipProps} openOn="hoverFocus" trigger={<input aria-label="Name" />} />);
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            const input = screen.getByRole("textbox", { name: "Name" });

            await user.keyboard("{Tab}");
            expect(input).toHaveFocus();
            await user.keyboard("Some text and spaces");
            expect(input).toHaveValue("Some text and spaces");
            expect(screen.queryByRole("tooltip")).toBeInTheDocument();
        });

        it("shows custom content on focus without moving focus into the tooltip", async () => {
            render(
                <Tooltip
                    {...defaultTooltipProps}
                    openOn="hoverFocus"
                    trigger={buttonTrigger}
                    renderMethod="custom"
                    htmlMessage={<div>Custom content</div>}
                    textMessage={undefined}
                />
            );
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            const button = screen.getByRole("button", { name: "Trigger button" });

            await user.keyboard("{Tab}");
            expect(screen.queryByRole("tooltip")).toHaveTextContent("Custom content");
            expect(button).toHaveFocus();
        });

        it("Escape closes the tooltip, keeps focus and doesn't reopen", async () => {
            render(<Tooltip {...defaultTooltipProps} openOn="hoverFocus" trigger={buttonTrigger} />);
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            const button = screen.getByRole("button", { name: "Trigger button" });

            await user.keyboard("{Tab}");
            expect(screen.queryByRole("tooltip")).toBeInTheDocument();

            await user.keyboard("{Escape}");
            expect(screen.queryByRole("tooltip")).toBeNull();
            expect(button).toHaveFocus();

            act(() => {
                jest.advanceTimersByTime(500);
            });
            expect(screen.queryByRole("tooltip")).toBeNull();
        });
    });

    describe("keyboard in click mode", () => {
        // Like the Mendix action button: handles Enter and Space itself, so the browser dispatches no click
        const NoNativeClickButton = (): ReactElement => (
            <button type="button" onKeyDown={e => e.preventDefault()} onKeyUp={e => e.preventDefault()}>
                Action button
            </button>
        );

        it.each(["{Enter}", " "])("toggles with %s on a button that dispatches no click", async key => {
            const clickSpy = jest.fn();
            render(
                <Tooltip
                    {...defaultTooltipProps}
                    openOn="click"
                    trigger={
                        <div onClick={clickSpy}>
                            <NoNativeClickButton />
                        </div>
                    }
                />
            );
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

            await user.keyboard("{Tab}");
            expect(screen.getByRole("button", { name: "Action button" })).toHaveFocus();
            expect(screen.queryByRole("tooltip")).toBeNull();

            await user.keyboard(key);
            expect(clickSpy).not.toHaveBeenCalled();
            expect(screen.queryByRole("tooltip")).toBeInTheDocument();

            await user.keyboard(key);
            expect(screen.queryByRole("tooltip")).toBeNull();
        });

        it.each(["{Enter}", " "])("toggles once with %s on a native button", async key => {
            const clickSpy = jest.fn();
            render(
                <Tooltip
                    {...defaultTooltipProps}
                    openOn="click"
                    trigger={
                        <button type="button" onClick={clickSpy}>
                            Native button
                        </button>
                    }
                />
            );
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

            await user.keyboard("{Tab}");
            await user.keyboard(key);
            expect(clickSpy).toHaveBeenCalledTimes(1);
            expect(screen.queryByRole("tooltip")).toBeInTheDocument();

            await user.keyboard(key);
            expect(clickSpy).toHaveBeenCalledTimes(2);
            expect(screen.queryByRole("tooltip")).toBeNull();
        });

        // Like a Mendix action button with an action: runs it and stops propagation of click and keydown
        const ActionButton = ({ onAction }: { onAction: () => void }): ReactElement => (
            <button
                type="button"
                onClick={e => {
                    e.stopPropagation();
                    onAction();
                }}
                onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        e.preventDefault();
                        if (e.key === "Enter") {
                            onAction();
                        }
                    }
                }}
                onKeyUp={e => {
                    if (e.key === " ") {
                        e.preventDefault();
                        onAction();
                    }
                }}
            >
                Button with action
            </button>
        );

        it("opens on mouse click on a button that stops propagation, and the button action still runs", async () => {
            const action = jest.fn();
            render(<Tooltip {...defaultTooltipProps} openOn="click" trigger={<ActionButton onAction={action} />} />);
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            const button = screen.getByRole("button", { name: "Button with action" });

            await user.click(button);
            expect(action).toHaveBeenCalledTimes(1);
            expect(screen.queryByRole("tooltip")).toBeInTheDocument();

            await user.click(button);
            expect(action).toHaveBeenCalledTimes(2);
            expect(screen.queryByRole("tooltip")).toBeNull();
        });

        it.each(["{Enter}", " "])(
            "toggles with %s on a button that stops propagation, and the button action still runs",
            async key => {
                const action = jest.fn();
                render(
                    <Tooltip {...defaultTooltipProps} openOn="click" trigger={<ActionButton onAction={action} />} />
                );
                const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

                await user.keyboard("{Tab}");
                await user.keyboard(key);
                expect(action).toHaveBeenCalledTimes(1);
                expect(screen.queryByRole("tooltip")).toBeInTheDocument();

                await user.keyboard(key);
                expect(action).toHaveBeenCalledTimes(2);
                expect(screen.queryByRole("tooltip")).toBeNull();
            }
        );

        it("opens on a synthetic click without key events, as screen readers send", () => {
            render(
                <Tooltip
                    {...defaultTooltipProps}
                    openOn="click"
                    trigger={<button type="button">Native button</button>}
                />
            );

            act(() => {
                screen.getByRole("button", { name: "Native button" }).click();
            });
            expect(screen.queryByRole("tooltip")).toBeInTheDocument();
        });

        it("doesn't swallow a mouse click after a key toggle on a button that dispatches no click", async () => {
            render(<Tooltip {...defaultTooltipProps} openOn="click" trigger={<NoNativeClickButton />} />);
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            const button = screen.getByRole("button", { name: "Action button" });

            await user.keyboard("{Tab}");
            await user.keyboard("{Enter}");
            expect(screen.queryByRole("tooltip")).toBeInTheDocument();

            await user.click(button);
            expect(screen.queryByRole("tooltip")).toBeNull();
        });

        it("doesn't toggle on Enter or Space in a text input, or on focus", async () => {
            render(<Tooltip {...defaultTooltipProps} openOn="click" trigger={<input aria-label="Name" />} />);
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            const input = screen.getByRole("textbox", { name: "Name" });

            await user.keyboard("{Tab}");
            expect(input).toHaveFocus();
            expect(screen.queryByRole("tooltip")).toBeNull();

            await user.keyboard("a b{Enter}");
            expect(input).toHaveValue("a b");
            expect(screen.queryByRole("tooltip")).toBeNull();
        });

        it("Escape closes the tooltip and keeps focus on the button", async () => {
            render(
                <Tooltip
                    {...defaultTooltipProps}
                    openOn="click"
                    trigger={<button type="button">Native button</button>}
                />
            );
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            const button = screen.getByRole("button", { name: "Native button" });

            await user.keyboard("{Tab}");
            await user.keyboard("{Enter}");
            expect(screen.queryByRole("tooltip")).toBeInTheDocument();

            await user.keyboard("{Escape}");
            expect(screen.queryByRole("tooltip")).toBeNull();
            expect(button).toHaveFocus();
        });
    });

    it("open tooltip onClick", async () => {
        render(<Tooltip {...defaultTooltipProps} openOn="click" />);
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        const triggerElement = screen.getByTestId("tooltip-trigger");
        // hover
        await user.hover(triggerElement);
        expect(screen.queryByRole("tooltip")).toBeNull();

        // unhover
        await user.unhover(triggerElement);
        expect(screen.queryByRole("tooltip")).toBeNull();

        // focus
        await user.keyboard("{Tab}");
        expect(triggerElement).toEqual(document.activeElement);
        expect(screen.queryByRole("tooltip")).toBeNull();

        // blur
        await user.keyboard("{Tab}");
        expect(triggerElement).not.toEqual(document.activeElement);
        expect(screen.queryByRole("tooltip")).toBeNull();

        // click
        await user.click(triggerElement);
        expect(screen.queryByRole("tooltip")).toBeInTheDocument();
        await user.click(triggerElement);
        expect(screen.queryByRole("tooltip")).toBeNull();
    });

    it("open tooltip onFocus and close onBlur", async () => {
        render(<Tooltip {...defaultTooltipProps} openOn="hoverFocus" />);
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        const triggerElement = screen.getByTestId("tooltip-trigger");

        // hover
        await user.hover(triggerElement);
        act(() => {
            jest.advanceTimersByTime(100);
        });
        expect(screen.queryByRole("tooltip")).toBeInTheDocument();

        // unhover
        await user.unhover(triggerElement);
        expect(screen.queryByRole("tooltip")).toBeNull();

        // focus
        await user.keyboard("{Tab}");
        expect(triggerElement).toEqual(document.activeElement);
        expect(screen.queryByRole("tooltip")).toBeInTheDocument();

        // blur
        await user.keyboard("{Tab}");
        expect(triggerElement).not.toEqual(document.activeElement);
        expect(screen.queryByRole("tooltip")).toBeNull();
    });

    it("render text content if the tooltipString is passed", async () => {
        render(<Tooltip {...defaultTooltipProps} renderMethod="text" />);
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        const triggerElement = screen.getByTestId("tooltip-trigger");
        await user.click(triggerElement);

        expect(screen.queryByRole("tooltip")).toHaveTextContent(defaultTooltipProps.textMessage as string);
    });

    it("render HTML if the content is passed", async () => {
        render(
            <Tooltip
                {...defaultTooltipProps}
                renderMethod="custom"
                htmlMessage={<div>Simple Tooltip</div>}
                textMessage={undefined}
            />
        );
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

        const triggerElement = screen.getByTestId("tooltip-trigger");
        await user.click(triggerElement);

        expect(screen.queryByText("Simple Tooltip")).toBeInTheDocument();
    });

    it("close onOutsideClick if tooltip is visible", async () => {
        render(<Tooltip {...defaultTooltipProps} openOn="click" />);
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        const triggerElement = screen.getByTestId("tooltip-trigger");
        await user.click(triggerElement);
        expect(screen.queryByRole("tooltip")).toBeInTheDocument();

        await user.click(document.body);
        expect(screen.queryByRole("tooltip")).toBeNull();
    });
});
