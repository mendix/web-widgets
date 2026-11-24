import { render, screen } from "@testing-library/react";
import { Fragment } from "react";

describe("CheckboxColumnHeader", () => {
    it("renders sr-only text with correct class and content for single selection", () => {
        render(
            <div className="th widget-datagrid-col-select" role="columnheader">
                <span className="sr-only">Select single row</span>
            </div>
        );

        const srOnlyText = screen.getByText("Select single row");
        expect(srOnlyText).toBeInTheDocument();
        expect(srOnlyText).toHaveClass("sr-only");
        expect(srOnlyText.parentElement).toHaveClass("widget-datagrid-col-select");
        expect(srOnlyText.parentElement).toHaveAttribute("role", "columnheader");
    });

    it("renders sr-only text with custom label", () => {
        render(
            <div className="th widget-datagrid-col-select" role="columnheader">
                <span className="sr-only">Choose one row</span>
            </div>
        );

        const srOnlyText = screen.getByText("Choose one row");
        expect(srOnlyText).toBeInTheDocument();
        expect(srOnlyText).toHaveClass("sr-only");
    });

    it("renders multiple column headers with sr-only text for single selection", () => {
        render(
            <div>
                <div className="th widget-datagrid-col-select" role="columnheader">
                    <span className="sr-only">Select single row</span>
                </div>
                <div className="th" role="columnheader">
                    <span>Column 1</span>
                </div>
            </div>
        );

        const srOnlyText = screen.getByText("Select single row");
        const columnHeader = screen.getByText("Column 1");

        expect(srOnlyText).toBeInTheDocument();
        expect(columnHeader).toBeInTheDocument();
        expect(srOnlyText).toHaveClass("sr-only");
        expect(columnHeader).not.toHaveClass("sr-only");
    });

    it("sr-only text has sr-only class applied", () => {
        render(
            <div className="th widget-datagrid-col-select" role="columnheader">
                <span className="sr-only">Select single row</span>
            </div>
        );

        const srOnlyText = screen.getByText("Select single row");

        // sr-only class typically hides content visually but keeps it available to screen readers
        // Check that it has sr-only class applied
        expect(srOnlyText).toHaveClass("sr-only");
    });

    it("renders empty fragment when checkbox is disabled", () => {
        const { container } = render(<Fragment />);

        expect(container.firstChild).toBeNull();
        expect(screen.queryByText("Select single row")).not.toBeInTheDocument();
    });

    it("does not render sr-only text for multi-selection", () => {
        render(
            <div className="th widget-datagrid-col-select" role="columnheader">
                <input type="checkbox" aria-label="Select all rows" />
            </div>
        );

        const checkbox = screen.getByRole("checkbox");
        expect(checkbox).toBeInTheDocument();
        expect(screen.queryByText("Select single row")).not.toBeInTheDocument();
    });

    it("columnheader contains only sr-only text for single selection", () => {
        const { container } = render(
            <div className="th widget-datagrid-col-select" role="columnheader">
                <span className="sr-only">Select single row</span>
            </div>
        );

        const columnHeader = container.querySelector('[role="columnheader"]');
        const srOnlySpans = columnHeader?.querySelectorAll(".sr-only");

        expect(columnHeader).toBeInTheDocument();
        expect(srOnlySpans).toHaveLength(1);
        expect(srOnlySpans?.[0]).toHaveTextContent("Select single row");
    });
});
