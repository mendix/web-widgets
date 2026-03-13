import "@testing-library/jest-dom";
import { render, RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BadgeButton, BadgeButtonProps } from "../BadgeButton";

describe("BadgeButton", () => {
    function renderBadgeButton(props: Partial<BadgeButtonProps>): RenderResult {
        return render(<BadgeButton {...props} />);
    }

    it("renders the structure correctly", () => {
        const badgeProps: BadgeButtonProps = {
            label: "Custom Label",
            onClick: jest.fn(),
            value: "0"
        };

        const badge = renderBadgeButton(badgeProps);

        const button = badge.getByRole("button", { name: /custom label/i });
        expect(button).toHaveClass("widget-badge-button btn btn-primary");

        const label = badge.getByText("Custom Label");
        expect(label).toHaveClass("widget-badge-button-text");

        const badgeValue = badge.getByText("0");
        expect(badgeValue).toHaveClass("badge");
    });

    it("responds to click events", async () => {
        const user = userEvent.setup();
        const onClickMock = jest.fn();
        const badgeProps: BadgeButtonProps = { onClick: onClickMock };
        const badge = renderBadgeButton(badgeProps);

        await user.click(badge.getByRole("button"));

        expect(onClickMock).toHaveBeenCalled();
    });

    it("renders correctly with custom classes", () => {
        const badge = renderBadgeButton({ className: "btn-secondary" });

        expect(badge.getByRole("button")).toHaveClass("btn btn-secondary");
    });

    describe("button style class detection", () => {
        it("does not add duplicate btn-primary when btn-success is present", () => {
            const badge = renderBadgeButton({ className: "btn-success" });
            const button = badge.getByRole("button");

            expect(button.className).toEqual("widget-badge-button btn btn-success");
        });

        it("adds btn-primary as default when no button style is present", () => {
            const badge = renderBadgeButton({ className: "custom-class" });
            const button = badge.getByRole("button");

            expect(button.className).toEqual("widget-badge-button btn btn-primary custom-class");
        });

        it("adds btn-primary when className is undefined", () => {
            const badge = renderBadgeButton({});
            const button = badge.getByRole("button");

            expect(button.className).toEqual("widget-badge-button btn btn-primary");
        });
    });
});
