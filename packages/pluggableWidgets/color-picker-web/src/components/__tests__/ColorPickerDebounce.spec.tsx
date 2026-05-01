import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { ColorPicker, ColorPickerProps } from "../ColorPicker";

/**
 * Mock all react-color pickers to expose controllable onChange / onChangeComplete
 * buttons, while still rendering with the expected CSS class names so the
 * existing picker-type tests continue to pass.
 */
jest.mock("react-color", () => {
    const colorState = {
        hex: "#FF0000",
        rgb: { r: 255, g: 0, b: 0, a: 1 },
        hsl: { h: 0, s: 1, l: 0.5, a: 1 }
    };

    type MockPickerProps = {
        onChange: (c: typeof colorState) => void;
        onChangeComplete: (c: typeof colorState) => void;
    };

    const createMockPicker = (cssClass: string) =>
        function MockPicker({ onChange, onChangeComplete }: MockPickerProps) {
            return (
                <div className={cssClass}>
                    <button data-testid="trigger-change" onClick={() => onChange(colorState)}>
                        change
                    </button>
                    <button data-testid="trigger-change-complete" onClick={() => onChangeComplete(colorState)}>
                        complete
                    </button>
                </div>
            );
        };

    return {
        SketchPicker: createMockPicker("sketch-picker"),
        ChromePicker: createMockPicker("chrome-picker"),
        BlockPicker: createMockPicker("block-picker"),
        GithubPicker: createMockPicker("github-picker"),
        TwitterPicker: createMockPicker("twitter-picker"),
        CirclePicker: createMockPicker("circle-picker"),
        HuePicker: createMockPicker("hue-picker"),
        SliderPicker: createMockPicker("slider-picker"),
        CompactPicker: createMockPicker("compact-picker"),
        MaterialPicker: createMockPicker("material-picker"),
        SwatchesPicker: createMockPicker("swatches-picker")
    };
});

describe("ColorPicker – debounced onChange behavior", () => {
    /**
     * color="#FF0000" matches the hex value emitted by the mock picker so that
     * the guard in onChangeComplete (`currentColor.current === parseColor(color, format)`)
     * passes and completeColorChange is actually scheduled.
     */
    const baseProps: ColorPickerProps = {
        id: "color-picker",
        name: "color picker",
        color: "#FF0000",
        disabled: false,
        defaultColors: [],
        format: "hex",
        mode: "inline",
        type: "sketch",
        onChange: jest.fn(),
        onColorChange: jest.fn()
    };

    let user: UserEvent;

    beforeEach(() => {
        jest.useFakeTimers();
        // advanceTimers keeps userEvent in sync with fake timers
        user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        baseProps.onChange = jest.fn();
        baseProps.onColorChange = jest.fn();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("does not call onChange immediately after onChangeComplete fires", async () => {
        const { getByTestId } = render(<ColorPicker {...baseProps} />);

        // onChange sets currentColor.current so the guard in onChangeComplete passes
        await user.click(getByTestId("trigger-change"));
        await user.click(getByTestId("trigger-change-complete"));

        // Debounce delay has not elapsed yet
        expect(baseProps.onChange).not.toHaveBeenCalled();
    });

    it("calls onChange once after the 500 ms debounce delay", async () => {
        const { getByTestId } = render(<ColorPicker {...baseProps} />);

        await user.click(getByTestId("trigger-change"));
        await user.click(getByTestId("trigger-change-complete"));

        expect(baseProps.onChange).not.toHaveBeenCalled();

        jest.advanceTimersByTime(500);

        expect(baseProps.onChange).toHaveBeenCalledTimes(1);
    });

    it("calls onChange only once when multiple rapid color changes occur", async () => {
        const { getByTestId } = render(<ColorPicker {...baseProps} />);

        // Each iteration: onChange aborts the previous pending debounce and
        // onChangeComplete schedules a new one. Only the last scheduled call
        // survives.
        for (let i = 0; i < 5; i++) {
            await user.click(getByTestId("trigger-change"));
            await user.click(getByTestId("trigger-change-complete"));
            // Advance less than the debounce window so the timer never fires mid-loop
            jest.advanceTimersByTime(100);
        }

        // Let the last pending debounce fire
        jest.advanceTimersByTime(500);

        expect(baseProps.onChange).toHaveBeenCalledTimes(1);
    });

    it("does not call onChange if abortCompleteColorChange is called before the delay elapses", async () => {
        const { getByTestId } = render(<ColorPicker {...baseProps} />);

        // Schedule a completeColorChange via onChangeComplete
        await user.click(getByTestId("trigger-change"));
        await user.click(getByTestId("trigger-change-complete"));

        // Advance partway through the debounce window
        jest.advanceTimersByTime(200);

        // Triggering onChange calls submitColor → abortCompleteColorChange,
        // cancelling the previously scheduled debounce
        await user.click(getByTestId("trigger-change"));

        // Advance past the original debounce deadline
        jest.advanceTimersByTime(500);

        expect(baseProps.onChange).not.toHaveBeenCalled();
    });
});
