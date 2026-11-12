import { act, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import userEvent from "@testing-library/user-event";
import { ReactElement, useEffect } from "react";
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

        // focus
        await user.keyboard("{Tab}");
        expect(triggerElement).toEqual(document.activeElement);
        expect(screen.queryByRole("tooltip")).toBeNull();

        // blur
        await user.keyboard("{Tab}");
        expect(triggerElement).not.toEqual(document.activeElement);
        expect(screen.queryByRole("tooltip")).toBeNull();
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
            const srOnlyContent = document.querySelector(".widget-tooltip-sr-only");

            expect(srOnlyContent).toBeInTheDocument();
            expect(srOnlyContent).toHaveTextContent(defaultTooltipProps.textMessage as string);
        });

        it("sr-only content is always in DOM even when tooltip is not visible", () => {
            render(<Tooltip {...defaultTooltipProps} openOn="click" />);
            const srOnlyContent = document.querySelector(".widget-tooltip-sr-only");

            // Content should exist before tooltip is shown
            expect(srOnlyContent).toBeInTheDocument();
            expect(screen.queryByRole("tooltip")).toBeNull();
        });

        it("sr-only content matches the text message", () => {
            const customMessage = "Custom accessibility message";
            render(<Tooltip {...defaultTooltipProps} textMessage={customMessage} />);
            const srOnlyContent = document.querySelector(".widget-tooltip-sr-only");

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
            const srOnlyContent = document.querySelector(".widget-tooltip-sr-only");

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

        it("makes content inert and aria-hidden only while closed", async () => {
            render(<Tooltip {...defaultTooltipProps} />);
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            const closedContent = document.querySelector(".widget-tooltip-sr-only");

            expect(closedContent).toHaveAttribute("inert");
            expect(closedContent).toHaveAttribute("aria-hidden", "true");

            await user.click(screen.getByTestId("tooltip-trigger"));
            const openContent = screen.getByRole("tooltip");

            expect(openContent).toBe(closedContent);
            expect(openContent).not.toHaveAttribute("inert");
            expect(openContent).not.toHaveAttribute("aria-hidden");
        });

        it("places focusable elements in closed custom content inside the inert element", () => {
            render(
                <Tooltip
                    {...defaultTooltipProps}
                    renderMethod="custom"
                    htmlMessage={<button>Inside tooltip</button>}
                    textMessage={undefined}
                />
            );

            expect(screen.getByText("Inside tooltip").closest("[inert]")).toBeInTheDocument();
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

        it("keeps an existing aria-describedby and restores it when the content is removed", () => {
            const trigger = <input aria-describedby="help-text" data-testid="input" />;
            const { rerender } = render(<Tooltip {...defaultTooltipProps} trigger={trigger} />);
            const input = screen.getByTestId("input");
            const contentId = document.querySelector(".widget-tooltip-sr-only")?.id;

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
            const contentId = document.querySelector(".widget-tooltip-sr-only")?.id;

            await act(async () => {
                rerender(<Tooltip {...defaultTooltipProps} trigger={<button data-testid="button">Button</button>} />);
            });

            expect(screen.getByTestId("button")).toHaveAttribute("aria-describedby", contentId);
        });

        it("adds the tooltip back when the trigger resets aria-describedby", async () => {
            render(<Tooltip {...defaultTooltipProps} trigger={<button data-testid="button">Button</button>} />);
            const button = screen.getByTestId("button");
            const contentId = document.querySelector(".widget-tooltip-sr-only")?.id;

            await act(async () => {
                button.setAttribute("aria-describedby", "validation-message");
            });

            expect(button).toHaveAttribute("aria-describedby", `validation-message ${contentId}`);
        });
    });
});
