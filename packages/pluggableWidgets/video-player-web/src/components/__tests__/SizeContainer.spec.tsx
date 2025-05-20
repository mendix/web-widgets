import { createElement, ReactNode } from "react";
import { render } from "@testing-library/react";

import { SizeContainer, SizeProps } from "../SizeContainer";

describe("Size container", () => {
    const defaultProps: SizeProps & { children: ReactNode } = {
        children: <span>Child</span>,
        className: "class-name",
        classNameInner: "class-name-inner",
        style: { backgroundColor: "aqua" },
        tabIndex: 1,
        widthUnit: "percentage",
        width: 100,
        heightUnit: "pixels",
        height: 25
    };

    it("renders correctly with height unit pixels", () => {
        const { asFragment } = render(<SizeContainer {...defaultProps} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders correctly with height unit percentage of width", () => {
        const { asFragment } = render(<SizeContainer {...defaultProps} heightUnit="percentageOfWidth" />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders correctly with pixel width & height unit percentage of width", () => {
        const { asFragment } = render(
            <SizeContainer {...defaultProps} widthUnit="pixels" heightUnit="percentageOfWidth" />
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders correctly with height unit percentage of parent", () => {
        const { asFragment } = render(<SizeContainer {...defaultProps} heightUnit="percentageOfParent" />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders correctly with height unit aspect ratio 1:1", () => {
        const { asFragment } = render(
            <SizeContainer {...defaultProps} heightUnit="aspectRatio" height={undefined} heightAspectRatio="oneByOne" />
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders correctly with height unit aspect ratio 4:3", () => {
        const { asFragment } = render(
            <SizeContainer
                {...defaultProps}
                heightUnit="aspectRatio"
                height={undefined}
                heightAspectRatio="fourByThree"
            />
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders correctly with height unit aspect ratio 3:2", () => {
        const { asFragment } = render(
            <SizeContainer
                {...defaultProps}
                heightUnit="aspectRatio"
                height={undefined}
                heightAspectRatio="threeByTwo"
            />
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders correctly with height unit aspect ratio 16:9", () => {
        const { asFragment } = render(
            <SizeContainer
                {...defaultProps}
                heightUnit="aspectRatio"
                height={undefined}
                heightAspectRatio="sixteenByNine"
            />
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders correctly with height unit aspect ratio 21:9", () => {
        const { asFragment } = render(
            <SizeContainer
                {...defaultProps}
                heightUnit="aspectRatio"
                height={undefined}
                heightAspectRatio="TwentyOneByNine"
            />
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders correctly with height unit aspect ratio & any width", () => {
        const { asFragment } = render(
            <SizeContainer
                {...defaultProps}
                width={68}
                heightUnit="aspectRatio"
                height={undefined}
                heightAspectRatio="TwentyOneByNine"
            />
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders correctly with pixel width & height unit aspect ratio", () => {
        const { asFragment } = render(
            <SizeContainer
                {...defaultProps}
                widthUnit="pixels"
                heightUnit="aspectRatio"
                height={undefined}
                heightAspectRatio="TwentyOneByNine"
            />
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
