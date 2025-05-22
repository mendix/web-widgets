import { createElement, ReactElement } from "react";
import { render } from "@testing-library/react";

import { Vimeo, VimeoProps } from "../Vimeo";

describe("VimeoPlayer Player", () => {
    const defaultProps = {
        url: "http://vimeo.com/123456",
        autoPlay: false,
        muted: false,
        loop: false,
        aspectRatio: false
    };

    const defaulPlayer = (props: VimeoProps): ReactElement => <Vimeo {...props} />;

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

    it("should render correctly with title", () => {
        const { asFragment } = render(defaulPlayer({ ...defaultProps, title: "Sample Video Title" }));
        expect(asFragment()).toMatchSnapshot();
    });
});
