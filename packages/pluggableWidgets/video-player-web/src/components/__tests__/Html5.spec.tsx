import { createElement, ReactElement } from "react";
import { render } from "@testing-library/react";

import { Html5, Html5PlayerProps } from "../Html5";

describe("Html5 Player", () => {
    const defaultProps = {
        url: "test",
        autoPlay: false,
        muted: false,
        loop: false,
        showControls: false,
        aspectRatio: false,
        poster: "test",
        preview: false
    };

    const defaulPlayer = (props: Html5PlayerProps): ReactElement => <Html5 {...props} />;

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

    it("should render correctly with loop", () => {
        const { asFragment } = render(defaulPlayer({ ...defaultProps, loop: true }));
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with poster", () => {
        const { asFragment } = render(
            defaulPlayer({
                ...defaultProps,
                poster: "https://www.mendix.com/wp-content/themes/mendix/ui/images/homepage/air-status-app@2x.png"
            })
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly in preview mode", () => {
        const { asFragment } = render(defaulPlayer({ ...defaultProps, preview: true }));
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render correctly with title", () => {
        const { asFragment } = render(defaulPlayer({ ...defaultProps, title: "Sample Video Title" }));
        expect(asFragment()).toMatchSnapshot();
    });
});
