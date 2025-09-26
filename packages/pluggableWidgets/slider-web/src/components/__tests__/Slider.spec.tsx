import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { Slider, SliderProps } from "../Slider";

describe("Slider", () => {
    afterEach(cleanup);

    const defaultSliderProps: SliderProps = {
        min: -100,
        max: 100,
        step: 10
    };

    function renderSlider(props?: Partial<SliderProps>): ReturnType<typeof render> {
        return render(<Slider {...defaultSliderProps} {...props} />);
    }

    it("renders horizontal Slider correctly", () => {
        const { asFragment } = renderSlider();
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders vertical Slider correctly", () => {
        const { asFragment } = renderSlider({ vertical: true });
        expect(asFragment()).toMatchSnapshot();
    });

    it("contains correct value", () => {
        renderSlider({ value: 30 });
        const handle = screen.getByRole("slider");
        expect(handle.getAttribute("aria-valuenow")).toBe("30");
    });

    it("handles keydown events", async () => {
        const onChange = jest.fn();
        render(<Slider {...defaultSliderProps} onChange={onChange} />);
        const sliderHandle = screen.getByRole("slider");
        sliderHandle.focus();

        fireEvent.keyDown(sliderHandle, { key: "ArrowUp", keyCode: 38, bubbles: true });
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0][0]).toEqual(-90);

        fireEvent.keyDown(sliderHandle, { key: "ArrowLeft", keyCode: 37, bubbles: true });
        expect(onChange).toHaveBeenCalledTimes(2);
        expect(onChange.mock.calls[1][0]).toEqual(-100);

        fireEvent.keyDown(sliderHandle, { key: "ArrowRight", keyCode: 39, bubbles: true });
        expect(onChange).toHaveBeenCalledTimes(3);
        expect(onChange.mock.calls[2][0]).toEqual(-90);
    });

    it("renders markers correctly", () => {
        const marks = {
            [-100]: "-100",
            [-50]: "-50",
            0: "0",
            50: "50",
            100: "100"
        };
        const sliderProps: SliderProps = {
            ...defaultSliderProps,
            marks
        };

        const { asFragment } = render(<Slider {...sliderProps} />);

        expect(asFragment()).toMatchSnapshot();

        for (const label of Object.values(marks)) {
            screen.getByText(new RegExp(`^${label}$`, "i"));
        }
    });
});
