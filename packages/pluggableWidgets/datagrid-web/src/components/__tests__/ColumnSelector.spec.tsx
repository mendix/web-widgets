import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { ColumnSelector, ColumnSelectorProps } from "../ColumnSelector";
import { GridColumn } from "../../typings/GridColumn";

let useIsElementInViewportMock = jest.fn(() => true);

jest.mock("../../utils/useIsElementInViewport", () => ({
    useIsElementInViewport: () => useIsElementInViewportMock()
}));

jest.mock("@mendix/widget-plugin-hooks/usePositionObserver", () => ({
    usePositionObserver: jest.fn((): DOMRect => ({ bottom: 0, right: 0 } as DOMRect))
}));

jest.useFakeTimers();

describe("Column Selector", () => {
    it("renders the structure correctly", () => {
        const component = render(<ColumnSelector {...mockColumnSelectorProps()} />);

        expect(component.asFragment()).toMatchSnapshot();
    });

    describe("focus", () => {
        it("classname for the ul element in ColumnSelector is NOT set to overflow", async () => {
            render(<ColumnSelector {...mockColumnSelectorProps()} />);
            expect(document.body).toHaveFocus();

            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            await user.click(screen.getByRole("button"));

            const element = document.querySelector(".column-selectors");
            expect(element?.classList.contains("overflow")).toBe(false);
        });

        it("classname for the ul element in ColumnSelector IS set to overflow", async () => {
            useIsElementInViewportMock = jest.fn(() => false);
            render(<ColumnSelector {...mockColumnSelectorProps()} />);
            expect(document.body).toHaveFocus();

            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            await user.click(screen.getByRole("button"));

            const element = document.querySelector(".column-selectors");
            expect(element?.classList.contains("overflow")).toBe(true);
        });

        it("changes focused element when pressing the button", async () => {
            render(<ColumnSelector {...mockColumnSelectorProps()} />);
            expect(document.body).toHaveFocus();

            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            await user.click(screen.getByRole("button"));

            jest.runOnlyPendingTimers();

            const items = screen.getAllByRole("menuitem");
            expect(items[0]).toHaveFocus();
        });

        it("changes focused element back to the input when pressing shift+tab in the first element", async () => {
            render(<ColumnSelector {...mockColumnSelectorProps()} />);
            expect(document.body).toHaveFocus();

            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            await user.click(screen.getByRole("button"));

            jest.runOnlyPendingTimers();

            const items = screen.getAllByRole("menuitem");
            expect(items[0]).toHaveFocus();

            await user.tab({ shift: true });

            jest.runOnlyPendingTimers();

            expect(screen.getByRole("button")).toHaveFocus();
        });

        it("changes focused element back to the input when pressing tab on the last item", async () => {
            render(
                <ColumnSelector
                    {...mockColumnSelectorProps()}
                    columns={
                        [
                            {
                                columnNumber: 0,
                                header: "Test",
                                canHide: true
                            },
                            {
                                columnNumber: 1,
                                header: "Test2",
                                canHide: true
                            }
                        ] as GridColumn[]
                    }
                />
            );
            expect(document.body).toHaveFocus();

            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            await user.click(screen.getByRole("button"));

            jest.runOnlyPendingTimers();

            const items = screen.getAllByRole("menuitem");
            expect(items[0]).toHaveFocus();
            await user.tab();
            expect(items[1]).toHaveFocus();
            await user.tab();

            jest.runOnlyPendingTimers();

            expect(screen.getByRole("button")).toHaveFocus();
        });

        it("changes focused element back to the input when pressing escape on any item", async () => {
            render(
                <ColumnSelector
                    {...mockColumnSelectorProps()}
                    columns={
                        [
                            {
                                columnNumber: 0,
                                header: "Test",
                                canHide: true
                            },
                            {
                                columnNumber: 1,
                                header: "Test2",
                                canHide: false
                            },
                            {
                                columnNumber: 2,
                                header: "Test3",
                                canHide: true
                            },
                            {
                                columnNumber: 3,
                                header: "Test4",
                                canHide: true
                            }
                        ] as GridColumn[]
                    }
                />
            );

            expect(document.body).toHaveFocus();

            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            await user.click(screen.getByRole("button"));

            jest.runOnlyPendingTimers();

            const items = screen.getAllByRole("menuitem");
            expect(items).toHaveLength(3);
            expect(items[0]).toHaveFocus();

            await user.tab();
            expect(items[1]).toHaveFocus();
            await user.keyboard("{Escape}");

            jest.runOnlyPendingTimers();

            expect(screen.getByRole("button")).toHaveFocus();
        });
    });
});

function mockColumnSelectorProps(): ColumnSelectorProps {
    return {
        columns: [
            {
                columnNumber: 1,
                header: "Test",
                canHide: true
            }
        ] as GridColumn[],
        id: "selector-under-test",
        hiddenColumns: [],
        setHiddenColumns: jest.fn(),
        visibleLength: 1
    };
}
