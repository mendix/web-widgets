import { shallow, ShallowWrapper } from "enzyme";
import { createElement } from "react";

import { SizeContainer, SizeProps } from "../SizeContainer";

const defaultProps: SizeProps = {
    className: "widget-signature",
    classNameInner: "",
    height: 300,
    width: 500,
    heightUnit: "pixels",
    widthUnit: "pixels",
    readOnly: false,
    style: {}
};

describe("Grid", () => {
    const renderGrid = (props: SizeProps): ShallowWrapper<SizeProps, any> =>
        shallow(createElement(SizeContainer, props));

    it("renders structure correctly", () => {
        const grid = renderGrid(defaultProps);

        expect(grid.getElement()).toMatchSnapshot();
    });

    it("with percentage units renders the structure correctly", () => {
        const grid = renderGrid(defaultProps);
        grid.setProps({
            heightUnit: "percentageOfWidth",
            widthUnit: "percentage",
            width: 80,
            height: 50
        });

        expect(grid.getElement()).toMatchSnapshot();
    });

    it("with percentage of parent units renders the structure correctly", () => {
        const grid = renderGrid(defaultProps);
        grid.setProps({
            heightUnit: "percentageOfParent",
            widthUnit: "percentage",
            width: 80,
            height: 50
        });

        expect(grid.getElement()).toMatchSnapshot();
    });

    it("with percentage and pixel units renders the structure correctly", () => {
        const grid = renderGrid(defaultProps);
        grid.setProps({
            heightUnit: "percentageOfWidth",
            widthUnit: "pixels",
            width: 80,
            height: 50
        });

        expect(grid.getElement()).toMatchSnapshot();
    });
});
