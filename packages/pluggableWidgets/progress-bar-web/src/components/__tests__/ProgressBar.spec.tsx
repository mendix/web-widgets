import "@testing-library/jest-dom";
import { render, RenderResult } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { createElement, ReactElement } from "react";
import { ProgressBar, ProgressBarProps } from "../ProgressBar";

describe("Progress bar", () => {
    const onClickSpy = jest.fn();
    const progress = 23;
    let user: UserEvent;

    function renderProgressBar(props: Partial<ProgressBarProps> = {}): RenderResult {
        return render(
            <ProgressBar
                currentValue={progress}
                minValue={0}
                maxValue={100}
                onClick={onClickSpy}
                label={`${progress}%`}
                class=""
                {...props}
            />
        );
    }

    beforeEach(() => {
        user = userEvent.setup();
    });

    it("has progress bar structure", () => {
        const progressBar = renderProgressBar();
        expect(progressBar.asFragment()).toMatchSnapshot();
    });

    it("shows a positive progress", () => {
        const { container } = renderProgressBar();
        expect(container.querySelector(".progress-bar")).toHaveStyle({ width: "23%" });
    });

    it("triggers an event when a clickable progress bar is clicked", async () => {
        const { container } = renderProgressBar();
        const progressElement = container.querySelector(".progress");
        expect(progressElement?.className.includes("widget-progress-bar-clickable")).toBe(true);
        await user.click(progressElement!);
        expect(onClickSpy).toHaveBeenCalledTimes(1);
    });

    it("handles a different range", () => {
        const { container } = renderProgressBar({ minValue: 20, maxValue: 30 });
        // 23 on a range from 20 to 30 is 30% progress.
        expect(container.querySelector(".progress-bar")).toHaveStyle({ width: "30%" });
    });

    it("clamps a current value lower than the minimum value to 0% progress", () => {
        const { container } = renderProgressBar({ currentValue: -20 });
        expect(container.querySelector(".progress-bar")).toHaveStyle({ width: "0%" });
    });

    it("clamps a current value higher than the maximum value to 100% progress", () => {
        const { container } = renderProgressBar({ currentValue: 110 });
        expect(container.querySelector(".progress-bar")).toHaveStyle({ width: "100%" });
    });

    it("is not clickable when there is no onClick handler provided", () => {
        const { container } = renderProgressBar({ currentValue: 50, onClick: undefined });
        expect(container.querySelector(".progress")?.className.includes("widget-progress-bar-clickable")).toBe(false);
    });

    describe("shows a runtime error Alert", () => {
        it("when the current value is lower than the minimum value", () => {
            const { container } = renderProgressBar({ currentValue: -20 });
            const alert = container.querySelector(".alert-danger");
            expect(alert).toBeInTheDocument();
            expect(alert?.textContent).toBe(
                "Error in progress bar values: The progress value is lower than the minimum value."
            );
        });

        it("when the current value is higher than the maximum value", () => {
            const { container } = renderProgressBar({ currentValue: 110 });
            const alert = container.querySelector(".alert-danger");
            expect(alert).toBeInTheDocument();
            expect(alert?.textContent).toBe(
                "Error in progress bar values: The progress value is higher than the maximum value."
            );
        });

        it("when the range of the progress bar is negative", () => {
            const { container } = renderProgressBar({ minValue: 40, maxValue: 30, currentValue: 50 });
            const alert = container.querySelector(".alert-danger");
            expect(alert).toBeInTheDocument();
            expect(alert?.textContent).toBe(
                "Error in progress bar values: The maximum value is lower than the minimum value."
            );
        });
    });

    describe("the label of the progressbar", () => {
        const RandomComponent = (): ReactElement => <div>This is a random component</div>;
        const progressBarSmallClassName = "progress-bar-small";

        it("should accept static text", () => {
            const { container } = renderProgressBar({ label: "This is your progress" });
            expect(container.textContent).toBe("This is your progress");
        });

        it("should accept a component", () => {
            const { container, getByText } = renderProgressBar({ label: <RandomComponent /> });
            expect(getByText("This is a random component")).toBeInTheDocument();
            expect(container.textContent).toContain("This is a random component");
        });

        it("should accept nothing", () => {
            const { container } = renderProgressBar({ label: null });
            // Should not render any label text
            // Remove whitespace for strict check
            expect(container.textContent?.trim()).toHaveLength(0);
        });

        it("has a tooltip with the label text when the size is small and label type is textual", () => {
            const { container } = renderProgressBar({
                label: "This is a label text",
                class: progressBarSmallClassName
            });
            const label = container.querySelector(".progress-bar");
            expect(label).toHaveAttribute("title", "This is a label text");
        });

        it("does not have a tooltip nor a label when the size is small and label type is custom", () => {
            const { container } = renderProgressBar({
                label: <RandomComponent />,
                class: progressBarSmallClassName
            });
            const label = container.querySelector(".progress-bar");
            expect(label).not.toHaveAttribute("title");
        });
    });
});
