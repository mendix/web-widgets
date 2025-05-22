import { createElement, ReactElement } from "react";
import { render } from "@testing-library/react";

import { Dailymotion, DailymotionProps } from "../Dailymotion";

describe("Dailymotion Player", () => {
    const defaultProps = {
        url: "test",
        autoPlay: false,
        muted: false,
        showControls: false,
        aspectRatio: false
    };

    const defaulPlayer = (props: DailymotionProps): ReactElement => <Dailymotion {...props} />;

    it("should render correctly", () => {
        const { asFragment } = render(defaulPlayer(defaultProps));
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with autoplay", () => {
        const { asFragment } = render(defaulPlayer({ ...defaultProps, autoPlay: true }));
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with muted", () => {
        const { asFragment } = render(defaulPlayer({ ...defaultProps, muted: true }));
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with controls", () => {
        const { asFragment } = render(defaulPlayer({ ...defaultProps, showControls: true }));
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with title", () => {
        const { asFragment } = render(defaulPlayer({ ...defaultProps, title: "Sample Video Title" }));
        expect(asFragment()).toMatchSnapshot();
    });
});
