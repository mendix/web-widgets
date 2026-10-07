import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { StatusBar } from "../StatusBar";

function renderStatusBar(
    content: string,
    metricType: "wordCount" | "characterCount" | "characterCountHtml"
): HTMLElement {
    render(<StatusBar content={content} metricType={metricType} />);
    return screen.getByRole("region", { name: "Editor status bar" });
}

// Contract: StatusBar renders one translated metric for the given content — words (whitespace
// separated tokens), characters of the plain text, or characters of the raw HTML — inside a
// focusable, labelled live region so screen readers hear the count change.
describe("StatusBar", () => {
    describe("word count", () => {
        it.each([
            ["  a  b ", 2],
            ["", 0],
            ["   \n\t ", 0],
            ["one", 1],
            ["one two\nthree\tfour", 4]
        ])("counts %j as %i words", (content, expected) => {
            expect(renderStatusBar(content, "wordCount")).toHaveTextContent(`Words: ${expected}`);
        });
    });

    describe("character count", () => {
        it.each([
            ["", 0],
            ["abc", 3],
            ["a b", 3],
            ["héllo", 5]
        ])("counts %j as %i characters", (content, expected) => {
            expect(renderStatusBar(content, "characterCount")).toHaveTextContent(`Characters: ${expected}`);
        });
    });

    describe("HTML character count", () => {
        it.each([
            ["", 0],
            ["<p>abc</p>", 10],
            ["<p><strong>a</strong></p>", 25]
        ])("counts %j as %i HTML characters", (content, expected) => {
            expect(renderStatusBar(content, "characterCountHtml")).toHaveTextContent(`Characters (HTML): ${expected}`);
        });
    });

    describe("accessibility", () => {
        it("renders a focusable, labelled, polite live region", () => {
            const region = renderStatusBar("a b", "wordCount");

            expect(region).toHaveClass("rich-text-status-bar");
            expect(region).toHaveAttribute("role", "region");
            expect(region).toHaveAttribute("aria-label", "Editor status bar");
            expect(region).toHaveAttribute("aria-live", "polite");
            expect(region).toHaveAttribute("tabindex", "0");
        });

        it("updates the announced text when the content changes", () => {
            const { rerender } = render(<StatusBar content="a" metricType="wordCount" />);
            rerender(<StatusBar content="a b c" metricType="wordCount" />);

            expect(screen.getByRole("region", { name: "Editor status bar" })).toHaveTextContent("Words: 3");
        });
    });
});
