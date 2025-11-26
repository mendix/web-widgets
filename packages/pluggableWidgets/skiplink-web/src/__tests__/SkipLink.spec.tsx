import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { SkipLinkContainerProps } from "../../typings/SkipLinkProps";
import { SkipLink } from "../SkipLink";

describe("SkipLink", () => {
    let defaultProps: SkipLinkContainerProps;
    let rootElement: HTMLElement;

    beforeEach(() => {
        // Set up the DOM structure that SkipLink expects
        document.body.innerHTML = "";
        rootElement = document.createElement("div");
        rootElement.id = "root";
        document.body.appendChild(rootElement);

        defaultProps = {
            name: "SkipLink1",
            class: "mx-skiplink",
            style: {},
            linkText: "Skip to main content",
            mainContentId: "main-content"
        };
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("renders skiplink widget and adds skip link to DOM", () => {
        render(<SkipLink {...defaultProps} />);

        // Check that the skip link was added to the root element
        const skipLink = rootElement.querySelector(".skip-link") as HTMLAnchorElement;
        expect(skipLink).toBeInTheDocument();
        expect(skipLink.textContent).toBe("Skip to main content");
        expect(skipLink.href).toBe(`${window.location.origin}/#main-content`);
        expect(skipLink.tabIndex).toBe(0);

        // Snapshot the actual root element that contains the skip link
        expect(rootElement).toMatchSnapshot();
    });

    it("renders with custom link text", () => {
        render(<SkipLink {...defaultProps} linkText="Jump to content" />);

        const skipLink = rootElement.querySelector(".skip-link") as HTMLAnchorElement;
        expect(skipLink).toBeInTheDocument();
        expect(skipLink.textContent).toBe("Jump to content");

        expect(rootElement).toMatchSnapshot();
    });

    it("renders with custom main content id", () => {
        render(<SkipLink {...defaultProps} mainContentId="content-area" />);

        const skipLink = rootElement.querySelector(".skip-link") as HTMLAnchorElement;
        expect(skipLink).toBeInTheDocument();
        expect(skipLink.href).toBe(`${window.location.origin}/#content-area`);

        expect(rootElement).toMatchSnapshot();
    });

    it("renders with empty main content id", () => {
        render(<SkipLink {...defaultProps} mainContentId="" />);

        const skipLink = rootElement.querySelector(".skip-link") as HTMLAnchorElement;
        expect(skipLink).toBeInTheDocument();
        expect(skipLink.href).toBe(`${window.location.origin}/#`);

        expect(rootElement).toMatchSnapshot();
    });

    it("cleans up skip link when component unmounts", () => {
        const { unmount } = render(<SkipLink {...defaultProps} />);

        // Verify skip link is present
        expect(rootElement.querySelector(".skip-link")).toBeInTheDocument();

        // Unmount and verify cleanup
        unmount();
        expect(rootElement.querySelector(".skip-link")).not.toBeInTheDocument();
    });
});
