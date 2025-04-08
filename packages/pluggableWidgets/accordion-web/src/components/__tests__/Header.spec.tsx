import "@testing-library/jest-dom";
import { render, RenderResult } from "@testing-library/react";
import { createElement, PropsWithChildren } from "react";
import { Header, HeaderProps } from "../Header";

describe("Header", () => {
    const defaultHeaderProps: PropsWithChildren<HeaderProps> = {
        heading: "headingThree",
        children: "Text"
    };

    function renderHeader(props: Partial<HeaderProps> = {}): RenderResult {
        return render(<Header {...defaultHeaderProps} {...props} />);
    }

    it("renders h1", () => {
        const header = renderHeader({ heading: "headingOne" });

        expect(header.container).toMatchSnapshot();
    });

    it("renders h2", () => {
        const header = renderHeader({ heading: "headingTwo" });

        expect(header.container).toMatchSnapshot();
    });

    it("renders h3", () => {
        const header = renderHeader();

        expect(header.container).toMatchSnapshot();
    });

    it("renders h4", () => {
        const header = renderHeader({ heading: "headingFour" });

        expect(header.container).toMatchSnapshot();
    });

    it("renders h5", () => {
        const header = renderHeader({ heading: "headingFive" });

        expect(header.container).toMatchSnapshot();
    });

    it("renders h6", () => {
        const header = renderHeader({ heading: "headingSix" });

        expect(header.container).toMatchSnapshot();
    });
});
