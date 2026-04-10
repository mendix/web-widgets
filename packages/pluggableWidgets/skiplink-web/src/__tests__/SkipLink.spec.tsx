import "@testing-library/jest-dom";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { DynamicValue, ValueStatus } from "mendix";
import { SkipLinkContainerProps, ListContentIdType } from "../../typings/SkipLinkProps";
import SkipLink from "../SkipLink";

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
            linkText: "main content",
            mainContentId: "main-content",
            skipToPrefix: "Skip to",
            listContentId: [],
            tabIndex: 0
        };
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    describe("Rendering", () => {
        it("renders skiplink widget and adds skip link to DOM", () => {
            render(<SkipLink {...defaultProps} />);

            const skipLink = rootElement.querySelector(".widget-skip-link") as HTMLAnchorElement;
            expect(skipLink).toBeInTheDocument();
            expect(skipLink.textContent).toBe("Skip to main content");
            expect(skipLink.href).toBe(`${window.location.origin}/#main-content`);
            expect(skipLink.tabIndex).toBe(0);
        });

        it("renders with custom link text", () => {
            render(<SkipLink {...defaultProps} linkText="content area" />);

            const skipLink = rootElement.querySelector(".widget-skip-link") as HTMLAnchorElement;
            expect(skipLink).toBeInTheDocument();
            expect(skipLink.textContent).toBe("Skip to content area");
        });

        it("renders with custom skip to prefix", () => {
            render(<SkipLink {...defaultProps} skipToPrefix="Jump to" linkText="content" />);

            const skipLink = rootElement.querySelector(".widget-skip-link") as HTMLAnchorElement;
            expect(skipLink).toBeInTheDocument();
            expect(skipLink.textContent).toBe("Jump to content");
        });

        it("renders with custom main content id", () => {
            render(<SkipLink {...defaultProps} mainContentId="content-area" />);

            const skipLink = rootElement.querySelector(".widget-skip-link") as HTMLAnchorElement;
            expect(skipLink).toBeInTheDocument();
            expect(skipLink.href).toBe(`${window.location.origin}/#content-area`);
        });

        it("renders with empty main content id", () => {
            render(<SkipLink {...defaultProps} mainContentId="" />);

            const skipLink = rootElement.querySelector(".widget-skip-link") as HTMLAnchorElement;
            expect(skipLink).toBeInTheDocument();
            expect(skipLink.href).toBe(`${window.location.origin}/#`);
        });

        it("inserts skip link as first child of root element", () => {
            // Add some existing content to root
            const existingDiv = document.createElement("div");
            existingDiv.id = "existing-content";
            rootElement.appendChild(existingDiv);

            render(<SkipLink {...defaultProps} />);

            // Skip link container should be first child
            expect(rootElement.firstElementChild?.querySelector(".widget-skip-link-container")).toBeInTheDocument();
        });

        it("logs error when root element is not found", () => {
            // Remove the root element
            document.body.removeChild(rootElement);

            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

            render(<SkipLink {...defaultProps} />);

            expect(consoleErrorSpy).toHaveBeenCalledWith("No root element found on page");

            consoleErrorSpy.mockRestore();

            // Restore root element for other tests
            rootElement = document.createElement("div");
            rootElement.id = "root";
            document.body.appendChild(rootElement);
        });
    });

    describe("Multiple Skip Links", () => {
        it("renders multiple skip links from listContentId", () => {
            const listContentId: ListContentIdType[] = [
                {
                    contentIdInList: {
                        status: ValueStatus.Available,
                        value: "navigation"
                    } as DynamicValue<string>,
                    LinkTextInList: "navigation menu"
                },
                {
                    contentIdInList: {
                        status: ValueStatus.Available,
                        value: "search"
                    } as DynamicValue<string>,
                    LinkTextInList: "search form"
                }
            ];

            render(<SkipLink {...defaultProps} listContentId={listContentId} />);

            const skipLinks = rootElement.querySelectorAll(".widget-skip-link");
            expect(skipLinks).toHaveLength(3); // Main + 2 additional

            expect(skipLinks[0].textContent).toBe("Skip to main content");
            expect(skipLinks[1].textContent).toBe("Skip to navigation menu");
            expect(skipLinks[2].textContent).toBe("Skip to search form");

            expect((skipLinks[1] as HTMLAnchorElement).href).toBe(`${window.location.origin}/#navigation`);
            expect((skipLinks[2] as HTMLAnchorElement).href).toBe(`${window.location.origin}/#search`);
        });

        it("filters out unavailable list items", () => {
            const listContentId: ListContentIdType[] = [
                {
                    contentIdInList: {
                        status: ValueStatus.Available,
                        value: "navigation"
                    } as DynamicValue<string>,
                    LinkTextInList: "navigation menu"
                },
                {
                    contentIdInList: {
                        status: ValueStatus.Loading,
                        value: undefined
                    } as DynamicValue<string>,
                    LinkTextInList: "loading item"
                },
                {
                    contentIdInList: {
                        status: ValueStatus.Available,
                        value: "footer"
                    } as DynamicValue<string>,
                    LinkTextInList: "footer"
                }
            ];

            render(<SkipLink {...defaultProps} listContentId={listContentId} />);

            const skipLinks = rootElement.querySelectorAll(".widget-skip-link");
            expect(skipLinks).toHaveLength(3); // Main + 2 available items (loading item filtered out)

            expect(skipLinks[0].textContent).toBe("Skip to main content");
            expect(skipLinks[1].textContent).toBe("Skip to navigation menu");
            expect(skipLinks[2].textContent).toBe("Skip to footer");
        });

        it("filters out list items with empty values", () => {
            const listContentId: ListContentIdType[] = [
                {
                    contentIdInList: {
                        status: ValueStatus.Available,
                        value: "navigation"
                    } as DynamicValue<string>,
                    LinkTextInList: "navigation menu"
                },
                {
                    contentIdInList: {
                        status: ValueStatus.Available,
                        value: ""
                    } as DynamicValue<string>,
                    LinkTextInList: "empty item"
                }
            ];

            render(<SkipLink {...defaultProps} listContentId={listContentId} />);

            const skipLinks = rootElement.querySelectorAll(".widget-skip-link");
            expect(skipLinks).toHaveLength(2); // Main + 1 valid item (empty value filtered out)
        });
    });

    describe("Visibility Behavior", () => {
        it("container has the correct CSS class for visibility behavior", () => {
            render(<SkipLink {...defaultProps} />);

            const container = rootElement.querySelector(".widget-skip-link-container") as HTMLElement;
            expect(container).toBeInTheDocument();
            expect(container).toHaveClass("widget-skip-link-container");
            // The CSS transform is applied via the class in SkipLink.scss
            // Actual visual hiding is tested in E2E tests
        });

        it("becomes visible when skip link receives focus", () => {
            render(<SkipLink {...defaultProps} />);

            const skipLink = rootElement.querySelector(".widget-skip-link") as HTMLAnchorElement;
            const container = rootElement.querySelector(".widget-skip-link-container") as HTMLElement;

            // Focus the skip link
            skipLink.focus();

            // Container should have :focus-within, which applies translateY(0)
            // We can verify the skip link has focus
            expect(skipLink).toHaveFocus();

            // The container should have the :focus-within pseudo-class active
            // We can check if container is an ancestor of the focused element
            expect(container.contains(document.activeElement)).toBe(true);
        });

        it("shows all skip links when any link is focused", () => {
            const listContentId: ListContentIdType[] = [
                {
                    contentIdInList: {
                        status: ValueStatus.Available,
                        value: "navigation"
                    } as DynamicValue<string>,
                    LinkTextInList: "navigation menu"
                }
            ];

            render(<SkipLink {...defaultProps} listContentId={listContentId} />);

            const skipLinks = rootElement.querySelectorAll(".widget-skip-link");
            const container = rootElement.querySelector(".widget-skip-link-container") as HTMLElement;

            // Focus the second skip link
            (skipLinks[1] as HTMLAnchorElement).focus();

            expect(skipLinks[1]).toHaveFocus();
            expect(container.contains(document.activeElement)).toBe(true);
        });
    });

    describe("Focus Management", () => {
        it("moves focus to target element when clicked", () => {
            // Create target element
            const mainContent = document.createElement("div");
            mainContent.id = "main-content";
            document.body.appendChild(mainContent);

            render(<SkipLink {...defaultProps} />);

            const skipLink = rootElement.querySelector(".widget-skip-link") as HTMLAnchorElement;

            // Click the skip link
            fireEvent.click(skipLink);

            // Target element should receive focus
            expect(mainContent).toHaveFocus();
            expect(mainContent.getAttribute("tabindex")).toBe("-1");
        });

        it("adds tabindex=-1 to non-focusable target element", () => {
            const mainContent = document.createElement("div");
            mainContent.id = "main-content";
            document.body.appendChild(mainContent);

            render(<SkipLink {...defaultProps} />);

            const skipLink = rootElement.querySelector(".widget-skip-link") as HTMLAnchorElement;

            // Initially no tabindex
            expect(mainContent.hasAttribute("tabindex")).toBe(false);

            fireEvent.click(skipLink);

            // After click, tabindex should be added
            expect(mainContent.getAttribute("tabindex")).toBe("-1");
            expect(mainContent).toHaveFocus();
        });

        it("preserves existing tabindex on target element", () => {
            const mainContent = document.createElement("div");
            mainContent.id = "main-content";
            mainContent.setAttribute("tabindex", "0");
            document.body.appendChild(mainContent);

            render(<SkipLink {...defaultProps} />);

            const skipLink = rootElement.querySelector(".widget-skip-link") as HTMLAnchorElement;

            fireEvent.click(skipLink);

            // Existing tabindex should be preserved
            expect(mainContent.getAttribute("tabindex")).toBe("0");
            expect(mainContent).toHaveFocus();
        });

        it("removes temporary tabindex when target element loses focus", async () => {
            const mainContent = document.createElement("div");
            mainContent.id = "main-content";
            document.body.appendChild(mainContent);

            render(<SkipLink {...defaultProps} />);

            const skipLink = rootElement.querySelector(".widget-skip-link") as HTMLAnchorElement;

            // Click to set focus
            fireEvent.click(skipLink);
            expect(mainContent.getAttribute("tabindex")).toBe("-1");

            // Blur the target element
            fireEvent.blur(mainContent);

            // Wait for blur event handler to execute
            await waitFor(() => {
                expect(mainContent.hasAttribute("tabindex")).toBe(false);
            });
        });

        it("focuses fallback <main> element when mainContentId is empty", () => {
            const mainElement = document.createElement("main");
            document.body.appendChild(mainElement);

            render(<SkipLink {...defaultProps} mainContentId="" />);

            const skipLink = rootElement.querySelector(".widget-skip-link") as HTMLAnchorElement;

            fireEvent.click(skipLink);

            expect(mainElement).toHaveFocus();
        });

        it("focuses correct target when list item is clicked", () => {
            const navigation = document.createElement("nav");
            navigation.id = "navigation";
            document.body.appendChild(navigation);

            const listContentId: ListContentIdType[] = [
                {
                    contentIdInList: {
                        status: ValueStatus.Available,
                        value: "navigation"
                    } as DynamicValue<string>,
                    LinkTextInList: "navigation menu"
                }
            ];

            render(<SkipLink {...defaultProps} listContentId={listContentId} />);

            const skipLinks = rootElement.querySelectorAll(".widget-skip-link");
            const navSkipLink = skipLinks[1] as HTMLAnchorElement;

            fireEvent.click(navSkipLink);

            expect(navigation).toHaveFocus();
        });

        it("logs error when target element is not found", () => {
            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

            render(<SkipLink {...defaultProps} mainContentId="non-existent" />);

            const skipLink = rootElement.querySelector(".widget-skip-link") as HTMLAnchorElement;

            fireEvent.click(skipLink);

            expect(consoleErrorSpy).toHaveBeenCalledWith("Element with id: non-existent not found on page");

            consoleErrorSpy.mockRestore();
        });

        it("logs error when no main element found and mainContentId is empty", () => {
            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

            render(<SkipLink {...defaultProps} mainContentId="" />);

            const skipLink = rootElement.querySelector(".widget-skip-link") as HTMLAnchorElement;

            fireEvent.click(skipLink);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Could not find a main element on page and no mainContentId specified in widget properties."
            );

            consoleErrorSpy.mockRestore();
        });

        it("prevents default link behavior on click", () => {
            const mainContent = document.createElement("div");
            mainContent.id = "main-content";
            document.body.appendChild(mainContent);

            render(<SkipLink {...defaultProps} />);

            const skipLink = rootElement.querySelector(".widget-skip-link") as HTMLAnchorElement;

            const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
            const preventDefaultSpy = jest.spyOn(clickEvent, "preventDefault");

            skipLink.dispatchEvent(clickEvent);

            expect(preventDefaultSpy).toHaveBeenCalled();
        });
    });

    describe("Focus Indicator Styling", () => {
        it("applies focus styles when skip link is focused", () => {
            render(<SkipLink {...defaultProps} />);

            const skipLink = rootElement.querySelector(".widget-skip-link") as HTMLAnchorElement;

            skipLink.focus();

            expect(skipLink).toHaveFocus();
            // The CSS :focus pseudo-class applies outline and background-color
            // We can verify the element has focus, actual styling is tested via E2E
        });
    });

    describe("Cleanup", () => {
        it("cleans up skip link when component unmounts", () => {
            const { unmount } = render(<SkipLink {...defaultProps} />);

            // Verify skip link is present
            expect(rootElement.querySelector(".widget-skip-link")).toBeInTheDocument();

            // Unmount and verify cleanup
            unmount();
            expect(rootElement.querySelector(".widget-skip-link")).not.toBeInTheDocument();
            expect(rootElement.querySelector(".widget-skip-link-container")).not.toBeInTheDocument();
        });

        it("removes portal element from DOM on unmount", () => {
            const { unmount } = render(<SkipLink {...defaultProps} />);

            // Portal should be inserted
            const portalContainer = rootElement.querySelector(".widget-skip-link-container")?.parentElement;
            expect(portalContainer).toBeInTheDocument();

            unmount();

            // Portal container should be removed
            expect(document.body.contains(portalContainer!)).toBe(false);
        });
    });

    describe("Custom Styling", () => {
        it("applies custom className to skip links", () => {
            render(<SkipLink {...defaultProps} class="custom-class" />);

            const skipLink = rootElement.querySelector(".widget-skip-link") as HTMLAnchorElement;
            expect(skipLink).toHaveClass("widget-skip-link");
            expect(skipLink).toHaveClass("custom-class");
        });

        it("applies custom tabIndex to skip links", () => {
            render(<SkipLink {...defaultProps} tabIndex={5} />);

            const skipLink = rootElement.querySelector(".widget-skip-link") as HTMLAnchorElement;
            expect(skipLink.tabIndex).toBe(5);
        });
    });
});
