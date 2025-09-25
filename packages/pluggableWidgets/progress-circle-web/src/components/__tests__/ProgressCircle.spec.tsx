import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import Circle from "../Circle/Circle";
import { FunctionComponent } from "react";
import { ProgressCircle } from "../ProgressCircle";

const mockedAnimate = jest.fn();

jest.mock("../Circle/Circle", () => {
    const originalModule = jest.requireActual("../Circle/Circle");
    return jest.fn().mockImplementation(() => ({
        ...originalModule,
        path: {
            className: {
                baseVal: ""
            }
        },
        animate: mockedAnimate,
        destroy: jest.fn()
    }));
});

function renderProgressCircle(props = {}): ReturnType<typeof render> {
    const defaultProps = {
        currentValue: 23,
        minValue: 0,
        maxValue: 100,
        onClick: jest.fn(),
        label: "23%",
        class: ""
    };
    return render(<ProgressCircle {...defaultProps} {...props} />);
}

describe("ProgressCircle", () => {
    it("renders the structure correctly", () => {
        renderProgressCircle();
        expect(screen.getByText("23%")).toBeInTheDocument();
    });

    it("renders the progressbar Circle", () => {
        renderProgressCircle();
        expect(Circle).toHaveBeenCalled();
        expect(mockedAnimate).toHaveBeenCalledWith(0.23);
    });

    it("triggers an event when a clickable progress bar is clicked", async () => {
        const user = userEvent.setup();
        const onClickSpy = jest.fn();
        renderProgressCircle({ onClick: onClickSpy });
        await user.click(screen.getByText("23%"));
        expect(onClickSpy).toHaveBeenCalled();
    });

    it("handles a different range", () => {
        renderProgressCircle({ currentValue: 40, minValue: 20, maxValue: 100, label: "25%", onClick: undefined });
        expect(mockedAnimate).toHaveBeenCalledWith(0.25);
        expect(screen.getByText("25%")).toBeInTheDocument();
    });

    it("clamps a current value lower than the minimum value to 0% progress", () => {
        renderProgressCircle({ currentValue: -20, minValue: 20, maxValue: 100, label: "0%", onClick: undefined });
        expect(mockedAnimate).toHaveBeenCalledWith(0);
        expect(screen.getByText("0%"))?.toBeInTheDocument();
    });

    it("clamps a current value higher than the maximum value to 100% progress", () => {
        renderProgressCircle({ currentValue: 102, minValue: 20, maxValue: 100, label: "100%", onClick: undefined });
        expect(mockedAnimate).toHaveBeenCalledWith(1);
        expect(screen.getByText("100%"))?.toBeInTheDocument();
    });

    it("is not clickable when there is no onClick handler provided", () => {
        renderProgressCircle({ onClick: undefined, label: undefined, currentValue: -1 });
        const labelContainer = document.querySelector(".progress-circle-label-container");
        expect(labelContainer).not.toHaveClass("widget-progress-circle-clickable");
    });

    describe("shows a runtime error Alert", () => {
        it("when the current value is lower than the minimum value", () => {
            renderProgressCircle({ currentValue: -1, minValue: 0, maxValue: 100, label: undefined });
            const alert = screen.getByRole("alert");
            expect(alert).toBeInTheDocument();
            expect(alert).toHaveTextContent(
                "Error in progress circle values: The progress value is lower than the minimum value."
            );
        });

        it("when the current value is higher than the maximum value", () => {
            renderProgressCircle({ currentValue: 200, minValue: 0, maxValue: 100, label: undefined });
            const alert = screen.getByRole("alert");
            expect(alert).toBeInTheDocument();
            expect(alert).toHaveTextContent(
                "Error in progress circle values: The progress value is higher than the maximum value."
            );
        });

        it("when the range of the progress bar is negative", () => {
            renderProgressCircle({ currentValue: 50, minValue: 100, maxValue: 0, label: undefined });
            const alert = screen.getByRole("alert");
            expect(alert).toBeInTheDocument();
            expect(alert).toHaveTextContent(
                "Error in progress circle values: The maximum value is lower than the minimum value."
            );
        });
    });

    describe("the label of the progressbar", () => {
        it("should accept static text", () => {
            renderProgressCircle({ currentValue: 50, minValue: 0, maxValue: 100, label: "This is a static text" });
            expect(screen.getByText("This is a static text")).toBeInTheDocument();
        });

        it("should accept a component", () => {
            const RandomComponent: FunctionComponent<any> = () => <div>This is a random component</div>;
            render(
                <ProgressCircle
                    currentValue={50}
                    minValue={0}
                    maxValue={100}
                    onClick={jest.fn()}
                    label={<RandomComponent />}
                    class=""
                />
            );
            expect(screen.getByText("This is a random component")).toBeInTheDocument();
        });

        it("should accept nothing", () => {
            renderProgressCircle({ currentValue: 50, minValue: 0, maxValue: 100, label: null });
            // Should not find any label text
            const labelContainer = document.querySelector(".progress-circle-label-container");
            expect(labelContainer?.textContent).toBe("");
        });
    });
});
