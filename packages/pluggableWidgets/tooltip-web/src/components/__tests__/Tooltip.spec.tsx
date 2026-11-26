import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import userEvent from "@testing-library/user-event";
import { ReactElement, useEffect } from "react";
import { Tooltip, TooltipProps } from "../Tooltip";

jest.useFakeTimers();

const getContentElement = (): HTMLElement | null => document.querySelector(".widget-tooltip-trigger + div");

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

        it("stays open while focus moves into custom content, and closes when focus leaves it", async () => {
            render(
                <Tooltip
                    {...defaultTooltipProps}
                    openOn="hoverFocus"
                    trigger={buttonTrigger}
                    renderMethod="custom"
                    htmlMessage={<button type="button">Inside tooltip</button>}
                    textMessage={undefined}
                />
            );
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

            await user.keyboard("{Tab}");
            expect(screen.queryByRole("tooltip")).toBeInTheDocument();

            await user.keyboard("{Tab}");
            act(() => {
                jest.advanceTimersByTime(100);
            });
            expect(screen.getByRole("button", { name: "Inside tooltip" })).toHaveFocus();
            expect(screen.queryByRole("tooltip")).toBeInTheDocument();

            await user.keyboard("{Tab}");
            act(() => {
                jest.advanceTimersByTime(100);
            });
            expect(screen.queryByRole("tooltip")).toBeNull();
        });

        it("Escape inside custom content closes the tooltip and moves focus back to the trigger", async () => {
            render(
                <Tooltip
                    {...defaultTooltipProps}
                    openOn="hoverFocus"
                    trigger={buttonTrigger}
                    renderMethod="custom"
                    htmlMessage={<button type="button">Inside tooltip</button>}
                    textMessage={undefined}
                />
            );
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

            await user.keyboard("{Tab}{Tab}");
            expect(screen.getByRole("button", { name: "Inside tooltip" })).toHaveFocus();

            await user.keyboard("{Escape}");
            expect(screen.queryByRole("tooltip")).toBeNull();
            expect(screen.getByRole("button", { name: "Trigger button" })).toHaveFocus();
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

        it("toggles once when Enter is held down", async () => {
            render(
                <Tooltip
                    {...defaultTooltipProps}
                    openOn="click"
                    trigger={<button type="button">Native button</button>}
                />
            );
            const button = screen.getByRole("button", { name: "Native button" });

            // Holding a key sends one keydown, then repeated keydowns with repeat set
            fireEvent.keyDown(button, { key: "Enter" });
            fireEvent.keyDown(button, { key: "Enter", repeat: true });
            fireEvent.keyDown(button, { key: "Enter", repeat: true });
            fireEvent.keyDown(button, { key: "Enter", repeat: true });
            fireEvent.keyUp(button, { key: "Enter" });
            expect(screen.queryByRole("tooltip")).toBeInTheDocument();
        });

        it("a click in a text box opens the tooltip and a second click doesn't close it", async () => {
            render(<Tooltip {...defaultTooltipProps} openOn="click" trigger={<input aria-label="Name" />} />);
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            const input = screen.getByRole("textbox", { name: "Name" });

            await user.click(input);
            expect(screen.queryByRole("tooltip")).toBeInTheDocument();
            await user.click(input);
            expect(screen.queryByRole("tooltip")).toBeInTheDocument();
        });

        it("Space on a check box opens the tooltip and doesn't close it on the next Space", async () => {
            render(
                <Tooltip
                    {...defaultTooltipProps}
                    openOn="click"
                    trigger={<input type="checkbox" aria-label="Agree" />}
                />
            );
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            const checkbox = screen.getByRole("checkbox", { name: "Agree" });

            await user.keyboard("{Tab}");
            await user.keyboard(" ");
            expect(checkbox).toBeChecked();
            expect(screen.queryByRole("tooltip")).toBeInTheDocument();

            await user.keyboard(" ");
            expect(checkbox).not.toBeChecked();
            expect(screen.queryByRole("tooltip")).toBeInTheDocument();
        });

        it("Enter on a nested tooltip's trigger opens only the nested tooltip", async () => {
            render(
                <Tooltip
                    {...defaultTooltipProps}
                    openOn="click"
                    textMessage="Outer text"
                    trigger={
                        <div>
                            <Tooltip
                                {...defaultTooltipProps}
                                openOn="click"
                                textMessage="Inner text"
                                trigger={<button type="button">Inner button</button>}
                            />
                        </div>
                    }
                />
            );
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

            await user.keyboard("{Tab}");
            expect(screen.getByRole("button", { name: "Inner button" })).toHaveFocus();
            await user.keyboard("{Enter}");
            expect(screen.getAllByRole("tooltip").map(tooltip => tooltip.textContent)).toEqual(["Inner text"]);

            await user.keyboard("{Enter}");
            expect(screen.queryByRole("tooltip")).toBeNull();
        });

        it("Escape inside custom content closes the tooltip and moves focus back to the trigger", async () => {
            render(
                <Tooltip
                    {...defaultTooltipProps}
                    openOn="click"
                    trigger={<button type="button">Native button</button>}
                    renderMethod="custom"
                    htmlMessage={<button type="button">Inside tooltip</button>}
                    textMessage={undefined}
                />
            );
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

            await user.keyboard("{Tab}{Enter}{Tab}");
            expect(screen.getByRole("button", { name: "Inside tooltip" })).toHaveFocus();

            await user.keyboard("{Escape}");
            expect(screen.queryByRole("tooltip")).toBeNull();
            expect(screen.getByRole("button", { name: "Native button" })).toHaveFocus();
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

        expect(screen.queryByRole("tooltip")).toHaveTextContent("Simple Tooltip");
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

    describe("accessibility", () => {
        it("adds aria-describedby to trigger element", () => {
            render(<Tooltip {...defaultTooltipProps} />);
            const triggerElement = screen.getByTestId("tooltip-trigger");

            expect(triggerElement).toHaveAttribute("aria-describedby");
        });

        it("renders sr-only content for screen readers before tooltip is shown", () => {
            render(<Tooltip {...defaultTooltipProps} />);
            const srOnlyContent = getContentElement();

            expect(srOnlyContent).toBeInTheDocument();
            expect(srOnlyContent).toHaveTextContent(defaultTooltipProps.textMessage as string);
        });

        it("sr-only content is always in DOM even when tooltip is not visible", () => {
            render(<Tooltip {...defaultTooltipProps} openOn="click" />);
            const srOnlyContent = getContentElement();

            // Content should exist before tooltip is shown
            expect(srOnlyContent).toBeInTheDocument();
            expect(screen.queryByRole("tooltip")).toBeNull();
        });

        it("sr-only content matches the text message", () => {
            const customMessage = "Custom accessibility message";
            render(<Tooltip {...defaultTooltipProps} textMessage={customMessage} />);
            const srOnlyContent = getContentElement();

            expect(srOnlyContent).toHaveTextContent(customMessage);
        });

        it("sr-only content matches the HTML message", () => {
            const htmlContent = <div>Custom HTML Content</div>;
            render(
                <Tooltip
                    {...defaultTooltipProps}
                    renderMethod="custom"
                    htmlMessage={htmlContent}
                    textMessage={undefined}
                />
            );
            const srOnlyContent = getContentElement();

            expect(srOnlyContent).toHaveTextContent("Custom HTML Content");
        });

        it("does not add aria-describedby when no tooltip content is provided", () => {
            render(<Tooltip {...defaultTooltipProps} textMessage={undefined} htmlMessage={undefined} />);
            const triggerElement = screen.getByTestId("tooltip-trigger");

            expect(triggerElement).not.toHaveAttribute("aria-describedby");
        });

        it("renders open custom content once and keeps widgets mounted across open and close", async () => {
            const onMount = jest.fn();
            const CustomWidget = (): ReactElement => {
                useEffect(onMount, []);
                return <div>Custom widget</div>;
            };
            render(
                <Tooltip
                    {...defaultTooltipProps}
                    renderMethod="custom"
                    htmlMessage={<CustomWidget />}
                    textMessage={undefined}
                />
            );
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            const triggerElement = screen.getByTestId("tooltip-trigger");

            await user.click(triggerElement);
            expect(screen.getAllByText("Custom widget")).toHaveLength(1);

            await user.click(triggerElement);
            expect(screen.getAllByText("Custom widget")).toHaveLength(1);
            expect(onMount).toHaveBeenCalledTimes(1);
        });

        it("hides content with display: none only while closed", async () => {
            render(<Tooltip {...defaultTooltipProps} />);
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            const closedContent = getContentElement();

            expect(closedContent).toHaveAttribute("hidden");
            expect(closedContent).not.toHaveAttribute("inert");
            expect(closedContent).not.toHaveAttribute("aria-hidden");

            await user.click(screen.getByTestId("tooltip-trigger"));
            const openContent = screen.getByRole("tooltip");

            expect(openContent).toBe(closedContent);
            expect(openContent).not.toHaveAttribute("hidden");
            expect(openContent).not.toHaveAttribute("inert");
            expect(openContent).not.toHaveAttribute("aria-hidden");
        });

        it("places focusable elements in closed custom content inside the hidden element", () => {
            render(
                <Tooltip
                    {...defaultTooltipProps}
                    renderMethod="custom"
                    htmlMessage={<button>Inside tooltip</button>}
                    textMessage={undefined}
                />
            );

            expect(screen.getByText("Inside tooltip").closest("[hidden]")).toBeInTheDocument();
        });

        it("ignores custom content in text mode when the text is empty", async () => {
            render(
                <Tooltip {...defaultTooltipProps} htmlMessage={<div>Custom content</div>} textMessage={undefined} />
            );
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            const triggerElement = screen.getByTestId("tooltip-trigger");

            expect(triggerElement).not.toHaveAttribute("aria-describedby");

            await user.click(triggerElement);
            expect(screen.queryByText("Custom content")).toBeNull();
            expect(screen.queryByRole("tooltip")).toBeNull();
        });

        it("renders preview content once without adding a description", () => {
            render(
                <Tooltip
                    {...defaultTooltipProps}
                    preview
                    renderMethod="custom"
                    htmlMessage={<div>Drop zone</div>}
                    textMessage={undefined}
                />
            );

            expect(screen.getAllByText("Drop zone")).toHaveLength(1);
            expect(screen.getByTestId("tooltip-trigger")).not.toHaveAttribute("aria-describedby");
        });

        it("adds no description and does not open when custom content renders nothing", async () => {
            const EmptyWidget = (): null => null;
            render(
                <Tooltip
                    {...defaultTooltipProps}
                    renderMethod="custom"
                    htmlMessage={<EmptyWidget />}
                    textMessage={undefined}
                />
            );
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            const triggerElement = screen.getByTestId("tooltip-trigger");

            expect(triggerElement).not.toHaveAttribute("aria-describedby");

            await user.click(triggerElement);
            expect(screen.queryByRole("tooltip")).toBeNull();
        });

        it("follows custom content as it is shown and hidden", async () => {
            const ConditionalWidget = ({ visible }: { visible: boolean }): ReactElement | null =>
                visible ? <span>Conditional content</span> : null;
            const renderTooltip = (visible: boolean): ReactElement => (
                <Tooltip
                    {...defaultTooltipProps}
                    renderMethod="custom"
                    htmlMessage={<ConditionalWidget visible={visible} />}
                    textMessage={undefined}
                />
            );
            const { rerender } = render(renderTooltip(false));
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            const triggerElement = screen.getByTestId("tooltip-trigger");

            await act(async () => {
                rerender(renderTooltip(true));
            });
            expect(triggerElement).toHaveAttribute("aria-describedby", getContentElement()?.id);

            await user.click(triggerElement);
            expect(screen.getByRole("tooltip")).toHaveTextContent("Conditional content");

            await act(async () => {
                rerender(renderTooltip(false));
            });
            expect(triggerElement).not.toHaveAttribute("aria-describedby");
            expect(screen.queryByRole("tooltip")).toBeNull();
        });

        it("renders no content and adds no description for whitespace-only text", () => {
            render(<Tooltip {...defaultTooltipProps} textMessage="   " />);

            expect(getContentElement()).toBeNull();
            expect(screen.getByTestId("tooltip-trigger")).not.toHaveAttribute("aria-describedby");
        });

        it("treats custom content with only an image as visible", () => {
            render(
                <Tooltip
                    {...defaultTooltipProps}
                    renderMethod="custom"
                    htmlMessage={<img alt="Help" src="help.png" />}
                    textMessage={undefined}
                />
            );

            expect(screen.getByTestId("tooltip-trigger")).toHaveAttribute("aria-describedby", getContentElement()?.id);
        });

        it("shows empty custom content in preview", () => {
            const EmptyWidget = (): null => null;
            render(
                <Tooltip
                    {...defaultTooltipProps}
                    preview
                    renderMethod="custom"
                    htmlMessage={<EmptyWidget />}
                    textMessage={undefined}
                />
            );

            expect(getContentElement()).toBeInTheDocument();
            expect(getContentElement()).not.toHaveAttribute("hidden");
        });

        it("adds aria-describedby to all focusable elements in trigger", () => {
            render(
                <Tooltip
                    {...defaultTooltipProps}
                    trigger={
                        <div>
                            <button data-testid="button1">Button 1</button>
                            <button data-testid="button2">Button 2</button>
                            <a href="#" data-testid="link1">
                                Link
                            </a>
                        </div>
                    }
                />
            );

            const button1 = screen.getByTestId("button1");
            const button2 = screen.getByTestId("button2");
            const link = screen.getByTestId("link1");

            // All focusable elements should have aria-describedby
            expect(button1).toHaveAttribute("aria-describedby");
            expect(button2).toHaveAttribute("aria-describedby");
            expect(link).toHaveAttribute("aria-describedby");

            // All should point to the same sr-only content
            const ariaDescribedBy1 = button1.getAttribute("aria-describedby");
            const ariaDescribedBy2 = button2.getAttribute("aria-describedby");
            const ariaDescribedBy3 = link.getAttribute("aria-describedby");

            expect(ariaDescribedBy1).toBe(ariaDescribedBy2);
            expect(ariaDescribedBy2).toBe(ariaDescribedBy3);
        });

        it("does not add its description to elements of a nested tooltip", () => {
            render(
                <Tooltip
                    {...defaultTooltipProps}
                    textMessage="Outer text"
                    trigger={
                        <div>
                            <Tooltip
                                {...defaultTooltipProps}
                                renderMethod="custom"
                                textMessage={undefined}
                                htmlMessage={<button type="button">Inside inner tooltip</button>}
                                trigger={<button type="button">Inner button</button>}
                            />
                        </div>
                    }
                />
            );

            const innerButton = screen.getByRole("button", { name: "Inner button" });
            const describedBy = innerButton.getAttribute("aria-describedby")?.split(" ") ?? [];

            expect(describedBy).toHaveLength(1);
            expect(document.getElementById(describedBy[0])).toHaveTextContent("Inside inner tooltip");
            expect(screen.getByText("Inside inner tooltip")).not.toHaveAttribute("aria-describedby");
        });

        it("keeps an existing aria-describedby and restores it when the content is removed", () => {
            const trigger = <input aria-describedby="help-text" data-testid="input" />;
            const { rerender } = render(<Tooltip {...defaultTooltipProps} trigger={trigger} />);
            const input = screen.getByTestId("input");
            const contentId = getContentElement()?.id;

            expect(input).toHaveAttribute("aria-describedby", `help-text ${contentId}`);

            rerender(<Tooltip {...defaultTooltipProps} trigger={trigger} textMessage={undefined} />);

            expect(input).toHaveAttribute("aria-describedby", "help-text");
        });

        it("removes aria-describedby when it only contained the tooltip", () => {
            const trigger = <button data-testid="button">Button</button>;
            const { rerender } = render(<Tooltip {...defaultTooltipProps} trigger={trigger} />);

            rerender(<Tooltip {...defaultTooltipProps} trigger={trigger} textMessage={undefined} />);

            expect(screen.getByTestId("button")).not.toHaveAttribute("aria-describedby");
        });

        it("adds aria-describedby to focusable elements that mount later", async () => {
            const { rerender } = render(<Tooltip {...defaultTooltipProps} trigger={<span>Loading</span>} />);
            const contentId = getContentElement()?.id;

            await act(async () => {
                rerender(<Tooltip {...defaultTooltipProps} trigger={<button data-testid="button">Button</button>} />);
            });

            expect(screen.getByTestId("button")).toHaveAttribute("aria-describedby", contentId);
        });

        it("adds the tooltip back when the trigger resets aria-describedby", async () => {
            render(<Tooltip {...defaultTooltipProps} trigger={<button data-testid="button">Button</button>} />);
            const button = screen.getByTestId("button");
            const contentId = getContentElement()?.id;

            await act(async () => {
                button.setAttribute("aria-describedby", "validation-message");
            });

            expect(button).toHaveAttribute("aria-describedby", `validation-message ${contentId}`);
        });
    });
});
