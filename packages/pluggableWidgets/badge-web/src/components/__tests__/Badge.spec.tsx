import "@testing-library/jest-dom";
import { fireEvent, render, RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement } from "react";
import { Badge, BadgeProps } from "../Badge";

describe("Badge", () => {
    let defaultBadgeProps: BadgeProps;

    beforeEach(() => {
        defaultBadgeProps = {
            type: "badge",
            value: "text"
        };
    });

    function renderBadge(props: Partial<BadgeProps> = {}): RenderResult {
        return render(<Badge {...defaultBadgeProps} {...props} />);
    }

    it("renders as a badge", () => {
        const badge = renderBadge();

        expect(badge.asFragment()).toMatchSnapshot();
    });

    it("renders as a label", () => {
        const badge = renderBadge({ type: "label" });

        expect(badge.asFragment()).toMatchSnapshot();
    });

    it("renders when an empty string is passed as value", () => {
        const badge = renderBadge({ value: "" });

        expect(badge.asFragment()).toMatchSnapshot();
    });

    it("renders as a button like element when onClick function is passed", () => {
        const badge = renderBadge({ onClick: jest.fn() });

        expect(badge.asFragment()).toMatchSnapshot();
    });

    it("triggers onClick function with a click event", async () => {
        const onClickMock = jest.fn();
        const badge = renderBadge({ onClick: onClickMock });
        const user = userEvent.setup();

        await user.click(badge.getByRole("button"));

        expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it("renders as a button like element when onKeyDown function is passed", () => {
        const badge = renderBadge({ onKeyDown: jest.fn() });

        expect(badge.asFragment()).toMatchSnapshot();
    });

    it("triggers onKeyDown function on key down", async () => {
        const onKeyDownMock = jest.fn();
        const badge = renderBadge({ onKeyDown: onKeyDownMock });
        const button = badge.getByRole("button");

        await fireEvent.keyDown(button, { key: "Enter" });

        expect(onKeyDownMock).toHaveBeenCalledTimes(1);
    });

    it("renders with a tabIndex", () => {
        const badge = renderBadge({ tabIndex: 1 });

        expect(badge.asFragment()).toMatchSnapshot();
    });

    it("renders custom classes", () => {
        const badge = renderBadge({ className: "custom-class" });

        expect(badge.asFragment()).toMatchSnapshot();
    });

    it("renders custom styles", () => {
        const badge = renderBadge({ style: { padding: 5 } });

        expect(badge.asFragment()).toMatchSnapshot();
    });
});
