import { act, render, screen } from "@testing-library/react";
import { observable, runInAction } from "mobx";
import { SelectionStatus, SelectionStatusViewModel } from "../SelectionStatus";

function createViewModel(overrides: Partial<SelectionStatusViewModel> = {}): SelectionStatusViewModel {
    return {
        selectionStatus: "3 items selected",
        isVisible: true,
        ...overrides
    };
}

describe("SelectionStatus", () => {
    it("renders status region with role='status' when visible", () => {
        render(<SelectionStatus viewModel={createViewModel()} />);

        const status = screen.getByRole("status");
        expect(status).toBeInTheDocument();
    });

    it("renders selection status text", () => {
        render(<SelectionStatus viewModel={createViewModel({ selectionStatus: "5 items selected" })} />);

        expect(screen.getByRole("status")).toHaveTextContent("5 items selected");
    });

    it("renders nothing when not visible", () => {
        const { container } = render(<SelectionStatus viewModel={createViewModel({ isVisible: false })} />);

        expect(container.firstChild).toBeNull();
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("applies sr-only class for visual hiding", () => {
        render(<SelectionStatus viewModel={createViewModel()} />);

        expect(screen.getByRole("status")).toHaveClass("sr-only");
    });

    it("shows 'All X rows selected' text when all items selected", () => {
        render(<SelectionStatus viewModel={createViewModel({ selectionStatus: "All 100 rows selected." })} />);

        expect(screen.getByRole("status")).toHaveTextContent("All 100 rows selected.");
    });

    it("shows empty text when no items selected", () => {
        render(<SelectionStatus viewModel={createViewModel({ selectionStatus: "" })} />);

        expect(screen.getByRole("status")).toHaveTextContent("");
    });

    it("updates text reactively when selection count changes", () => {
        const vm = observable({
            selectionStatus: "1 item selected",
            isVisible: true
        });

        render(<SelectionStatus viewModel={vm} />);
        expect(screen.getByRole("status")).toHaveTextContent("1 item selected");

        act(() => {
            runInAction(() => {
                vm.selectionStatus = "3 items selected";
            });
        });
        expect(screen.getByRole("status")).toHaveTextContent("3 items selected");
    });

    it("status text matches SelectAllBar text format for all selected", () => {
        const allSelectedText = "All 100 rows selected.";
        render(<SelectionStatus viewModel={createViewModel({ selectionStatus: allSelectedText })} />);

        expect(screen.getByRole("status")).toHaveTextContent(allSelectedText);
    });
});
