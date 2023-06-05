import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Tooltip, TooltipProps } from "../Tooltip";
import userEvent from "@testing-library/user-event";

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
        const triggerElement = screen.getByTestId("tooltip-trigger");

        await userEvent.click(triggerElement);

        expect(asFragment()).toMatchSnapshot();
    });

    it("opens tooltip onMouseEnter and close onMouseLeave", async () => {
        render(<Tooltip {...defaultTooltipProps} openOn="hover" />);
        const triggerElement = screen.getByTestId("tooltip-trigger");

        // hover
        await userEvent.hover(triggerElement);
        expect(screen.queryByRole("tooltip")).toBeInTheDocument();

        // unhover
        await userEvent.unhover(triggerElement);
        expect(screen.queryByRole("tooltip")).toBeNull();

        // focus
        await userEvent.keyboard("{Tab}");
        expect(triggerElement).toEqual(document.activeElement);
        expect(screen.queryByRole("tooltip")).toBeNull();

        // blur
        await userEvent.keyboard("{Tab}");
        expect(triggerElement).not.toEqual(document.activeElement);
        expect(screen.queryByRole("tooltip")).toBeNull();
    });

    it("open tooltip onClick", async () => {
        render(<Tooltip {...defaultTooltipProps} openOn="click" />);
        const triggerElement = screen.getByTestId("tooltip-trigger");
        // hover
        await userEvent.hover(triggerElement);
        expect(screen.queryByRole("tooltip")).toBeNull();

        // unhover
        await userEvent.unhover(triggerElement);
        expect(screen.queryByRole("tooltip")).toBeNull();

        // focus
        await userEvent.keyboard("{Tab}");
        expect(triggerElement).toEqual(document.activeElement);
        expect(screen.queryByRole("tooltip")).toBeNull();

        // blur
        await userEvent.keyboard("{Tab}");
        expect(triggerElement).not.toEqual(document.activeElement);
        expect(screen.queryByRole("tooltip")).toBeNull();

        // click
        await userEvent.click(triggerElement);
        expect(screen.queryByRole("tooltip")).toBeInTheDocument();
        await userEvent.click(triggerElement);
        expect(screen.queryByRole("tooltip")).toBeNull();
    });

    it("open tooltip onFocus and close onBlur", async () => {
        render(<Tooltip {...defaultTooltipProps} openOn="hoverFocus" />);
        const triggerElement = screen.getByTestId("tooltip-trigger");

        // hover
        await userEvent.hover(triggerElement);
        expect(screen.queryByRole("tooltip")).toBeInTheDocument();

        // unhover
        await userEvent.unhover(triggerElement);
        expect(screen.queryByRole("tooltip")).toBeNull();

        // focus
        await userEvent.keyboard("{Tab}");
        expect(triggerElement).toEqual(document.activeElement);
        expect(screen.queryByRole("tooltip")).toBeInTheDocument();

        // blur
        await userEvent.keyboard("{Tab}");
        expect(triggerElement).not.toEqual(document.activeElement);
        expect(screen.queryByRole("tooltip")).toBeNull();
    });

    it("render text content if the tooltipString is passed", async () => {
        render(<Tooltip {...defaultTooltipProps} renderMethod="text" />);
        const triggerElement = screen.getByTestId("tooltip-trigger");
        await userEvent.click(triggerElement);

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

        const triggerElement = screen.getByTestId("tooltip-trigger");
        await userEvent.click(triggerElement);

        expect(screen.queryByText("Simple Tooltip")).toBeInTheDocument();
    });

    it("close onOutsideClick if tooltip is visible", async () => {
        render(<Tooltip {...defaultTooltipProps} openOn="click" />);
        const triggerElement = screen.getByTestId("tooltip-trigger");
        await userEvent.click(triggerElement);
        expect(screen.queryByRole("tooltip")).toBeInTheDocument();

        await userEvent.click(document.body);
        expect(screen.queryByRole("tooltip")).toBeNull();
    });
});
