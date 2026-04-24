import { act, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Tooltip, TooltipProps } from "../Tooltip";
import userEvent from "@testing-library/user-event";

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
            const srOnlyContent = document.querySelector(".sr-only");

            expect(srOnlyContent).toBeInTheDocument();
            expect(srOnlyContent).toHaveTextContent(defaultTooltipProps.textMessage as string);
        });

        it("sr-only content is always in DOM even when tooltip is not visible", () => {
            render(<Tooltip {...defaultTooltipProps} openOn="click" />);
            const srOnlyContent = document.querySelector(".sr-only");

            // Content should exist before tooltip is shown
            expect(srOnlyContent).toBeInTheDocument();
            expect(screen.queryByRole("tooltip")).toBeNull();
        });

        it("sr-only content matches the text message", () => {
            const customMessage = "Custom accessibility message";
            render(<Tooltip {...defaultTooltipProps} textMessage={customMessage} />);
            const srOnlyContent = document.querySelector(".sr-only");

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
            const srOnlyContent = document.querySelector(".sr-only");

            expect(srOnlyContent).toHaveTextContent("Custom HTML Content");
        });

        it("does not add aria-describedby when no tooltip content is provided", () => {
            render(<Tooltip {...defaultTooltipProps} textMessage={undefined} htmlMessage={undefined} />);
            const triggerElement = screen.getByTestId("tooltip-trigger");
            const parentElement = triggerElement.parentElement;

            expect(parentElement).not.toHaveAttribute("aria-describedby");
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
    });
});
