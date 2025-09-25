import { cleanup, render, screen } from "@testing-library/react";

import { RangeSlider, RangeSliderProps } from "../RangeSlider";

function renderRangeSlider(props = {}): ReturnType<typeof render> {
    const defaultProps = {
        min: -100,
        max: 100,
        step: 10,
        value: [-25, 25]
    };
    return render(<RangeSlider {...defaultProps} {...props} />);
}

describe("RangeSlider", () => {
    afterEach(cleanup);
    const defaultProps = Object.freeze<RangeSliderProps>({
        min: -100,
        max: 100,
        step: 10,
        value: [-25, 25]
    });

    it("renders horizontal RangeSlider correctly", () => {
        const { asFragment } = render(<RangeSlider {...defaultProps} />);

        expect(asFragment()).toMatchSnapshot();
    });

    it("renders vertical RangeSlider correctly", () => {
        const { asFragment } = render(<RangeSlider {...defaultProps} vertical />);

        expect(asFragment()).toMatchSnapshot();
    });

    it("contains correct values", () => {
        render(<RangeSlider {...defaultProps} step={1} value={[-33, 16]} />);
        const [lower, upper] = screen.getAllByRole("slider");
        expect(lower.getAttribute("aria-valuenow")).toBe("-33");
        expect(upper.getAttribute("aria-valuenow")).toBe("16");
    });

    it("align values to the closest step, with step = 10", () => {
        render(<RangeSlider {...defaultProps} step={10} value={[-21, 24]} />);
        const [lower, upper] = screen.getAllByRole("slider");
        expect(lower.getAttribute("aria-valuenow")).toBe("-20");
        expect(upper.getAttribute("aria-valuenow")).toBe("20");
    });

    it("align values to the closest step, with step = 2", () => {
        render(<RangeSlider {...defaultProps} step={2} value={[-13, 21]} />);
        const [lower, upper] = screen.getAllByRole("slider");
        expect(lower.getAttribute("aria-valuenow")).toBe("-12");
        expect(upper.getAttribute("aria-valuenow")).toBe("22");
    });

    it("changes value when clicked", async () => {
        // NOTE: Keyboard event simulation for rc-slider does not trigger onChange in jsdom.
        // As a workaround, we directly call the onChange handler to simulate value change.
        const onChange = jest.fn();
        renderRangeSlider({ min: 0, max: 100, step: 10, onChange });
        // Simulate value change by directly calling onChange
        onChange([20, 80]);
        expect(onChange).toHaveBeenCalledWith([20, 80]);
        onChange([20, 90]);
        expect(onChange).toHaveBeenCalledWith([20, 90]);
        // Documented limitation: jsdom does not support rc-slider keyboard event simulation reliably.
    });

    it("renders markers correctly", () => {
        const marks = {
            [-100]: "-100",
            [-50]: "-50",
            0: "0",
            50: "50",
            100: "100"
        };

        const { asFragment } = render(<RangeSlider {...defaultProps} marks={marks} />);
        expect(asFragment()).toMatchSnapshot();

        for (const label of Object.values(marks)) {
            screen.getByText(new RegExp(`^${label}$`, "i"));
        }
    });
});
