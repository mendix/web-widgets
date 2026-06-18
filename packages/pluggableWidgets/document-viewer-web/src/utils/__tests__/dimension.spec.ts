import { constructWrapperStyle, DimensionContainerProps } from "../dimension";

const baseProps: DimensionContainerProps = {
    widthUnit: "pixels",
    width: 300,
    heightUnit: "pixels",
    height: 400,
    minHeightUnit: "none",
    minHeight: 0,
    maxHeightUnit: "none",
    maxHeight: 0,
    overflowY: "auto"
};

describe("constructWrapperStyle", () => {
    it("builds pixel width and height", () => {
        expect(constructWrapperStyle(baseProps)).toEqual({
            width: "300px",
            height: "400px"
        });
    });

    it("builds percentage width", () => {
        expect(constructWrapperStyle({ ...baseProps, widthUnit: "percentage", width: 80 })).toMatchObject({
            width: "80%"
        });
    });

    it("uses fit-content for contentFit width", () => {
        expect(constructWrapperStyle({ ...baseProps, widthUnit: "contentFit" })).toMatchObject({
            width: "fit-content"
        });
    });

    it("sets height to auto for percentageOfWidth without min/max constraints", () => {
        expect(constructWrapperStyle({ ...baseProps, heightUnit: "percentageOfWidth" })).toEqual({
            width: "300px",
            height: "auto"
        });
    });

    it("applies min height when minHeightUnit is set", () => {
        const style = constructWrapperStyle({
            ...baseProps,
            heightUnit: "percentageOfWidth",
            minHeightUnit: "pixels",
            minHeight: 120
        });

        expect(style.minHeight).toBe("120px");
    });

    it("applies max height and overflow when maxHeightUnit is set", () => {
        const style = constructWrapperStyle({
            ...baseProps,
            heightUnit: "percentageOfWidth",
            maxHeightUnit: "percentageOfView",
            maxHeight: 50,
            overflowY: "scroll"
        });

        expect(style.maxHeight).toBe("50vh");
        expect(style.overflowY).toBe("scroll");
    });

    it("maps percentageOfParent height unit to a percentage value", () => {
        expect(constructWrapperStyle({ ...baseProps, heightUnit: "percentageOfParent", height: 75 })).toMatchObject({
            height: "75%"
        });
    });
});
