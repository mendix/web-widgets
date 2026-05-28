import { SliderProps as RcSliderProps } from "@rc-component/slider";
import { createRef, ReactElement } from "react";
import { createHandleRender } from "../createHandleRender";

const defaultRenderProps = {
    dragging: false,
    index: 0,
    prefixCls: "rc-slider-handle",
    draggingDelete: false,
    onFocus: jest.fn(),
    onBlur: jest.fn()
};

const mockNode = <div />;

function buildHandleRender(
    decimalPlaces: number,
    tooltipType: "value" | "customText" = "value",
    decimalSeparator = "."
): NonNullable<RcSliderProps["handleRender"]> {
    const sliderRef = createRef<HTMLDivElement>();
    return createHandleRender({
        tooltipType,
        tooltipAlwaysVisible: true,
        sliderRef,
        decimalPlaces,
        decimalSeparator
    })!;
}

describe("createHandleRender tooltip value formatting", () => {
    it("formats whole number with trailing zeros when decimalPlaces=2", () => {
        const result = buildHandleRender(2)(mockNode, { ...defaultRenderProps, value: 10 } as any) as ReactElement<any>;
        expect(result.props.overlay).toBe("10.00");
    });

    it("formats partial decimal with trailing zero when decimalPlaces=2", () => {
        const result = buildHandleRender(2)(mockNode, {
            ...defaultRenderProps,
            value: 9.2
        } as any) as ReactElement<any>;
        expect(result.props.overlay).toBe("9.20");
    });

    it("formats value without decimals when decimalPlaces=0", () => {
        const result = buildHandleRender(0)(mockNode, { ...defaultRenderProps, value: 10 } as any) as ReactElement<any>;
        expect(result.props.overlay).toBe("10");
    });

    it("uses locale decimal separator", () => {
        const result = buildHandleRender(
            2,
            "value",
            ","
        )(mockNode, {
            ...defaultRenderProps,
            value: 9.2
        } as any) as ReactElement<any>;
        expect(result.props.overlay).toBe("9,20");
    });

    it("renders custom text tooltip ignoring value formatting", () => {
        const sliderRef = createRef<HTMLDivElement>();
        const handleRender = createHandleRender({
            tooltip: { value: "custom label" } as any,
            tooltipType: "customText",
            tooltipAlwaysVisible: true,
            sliderRef,
            decimalPlaces: 2,
            decimalSeparator: "."
        })!;
        const result = handleRender(mockNode, { ...defaultRenderProps, value: 10 } as any) as ReactElement<any>;
        expect(result.props.overlay.props.children).toBe("custom label");
    });
});
