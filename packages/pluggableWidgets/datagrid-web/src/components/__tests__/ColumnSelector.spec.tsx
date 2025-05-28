import { createElement } from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { ColumnSelector, ColumnSelectorProps } from "../ColumnSelector";
import { ColumnId, GridColumn } from "../../typings/GridColumn";

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
            await act(async () => {
                await user.click(screen.getByRole("button"));
            });

            const element = document.querySelector(".column-selectors");
            expect(element?.classList.contains("overflow")).toBe(false);
        });

        it("changes focused element when pressing the button", async () => {
            render(<ColumnSelector {...mockColumnSelectorProps()} />);
            expect(document.body).toHaveFocus();

            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            await act(async () => {
                await user.click(screen.getByRole("button"));
            });

            jest.advanceTimersByTime(100);

            const items = screen.getAllByRole("menuitem");
            expect(items[0]).toHaveFocus();
        });

        it("changes focused element back to the input when pressing shift+tab in the first element", async () => {
            render(<ColumnSelector {...mockColumnSelectorProps()} />);
            expect(document.body).toHaveFocus();

            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            await act(async () => {
                await user.click(screen.getByRole("button"));
            });

            jest.advanceTimersByTime(100);

            const items = screen.getAllByRole("menuitem");
            expect(items[0]).toHaveFocus();

            await act(async () => {
                await user.tab({ shift: true });
            });

            jest.advanceTimersByTime(100);

            expect(screen.getByRole("button")).toHaveFocus();
        });

        it("changes focused element back to the input when pressing tab on the last item", async () => {
            render(
                <ColumnSelector
                    {...mockColumnSelectorProps()}
                    columns={
                        [
                            {
                                columnId: "0" as ColumnId,
                                header: "Test",
                                canHide: true
                            },
                            {
                                columnId: "1" as ColumnId,
                                header: "Test2",
                                canHide: true
                            }
                        ] as GridColumn[]
                    }
                />
            );
            expect(document.body).toHaveFocus();

            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            await act(async () => {
                await user.click(screen.getByRole("button"));
            });
            jest.advanceTimersByTime(100);

            const items = screen.getAllByRole("menuitem");
            expect(items[0]).toHaveFocus();

            await act(async () => {
                await user.tab();
            });
            jest.advanceTimersByTime(100);

            expect(items[1]).toHaveFocus();
            await act(async () => {
                await user.tab();
            });
            jest.advanceTimersByTime(100);

            expect(screen.getByRole("button")).toHaveFocus();
        });

        it("changes focused element back to the input when pressing escape on any item", async () => {
            render(
                <ColumnSelector
                    {...mockColumnSelectorProps()}
                    columns={
                        [
                            {
                                columnId: "0" as ColumnId,
                                header: "Test",
                                canHide: true
                            },
                            {
                                columnId: "1" as ColumnId,
                                header: "Test2",
                                canHide: false
                            },
                            {
                                columnId: "2" as ColumnId,
                                header: "Test3",
                                canHide: true
                            },
                            {
                                columnId: "3" as ColumnId,
                                header: "Test4",
                                canHide: true
                            }
                        ] as GridColumn[]
                    }
                />
            );

            expect(document.body).toHaveFocus();

            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

            await act(async () => {
                await user.click(screen.getByRole("button"));
            });
            jest.advanceTimersByTime(100);

            const items = screen.getAllByRole("menuitem");
            expect(items).toHaveLength(3);
            expect(items[0]).toHaveFocus();

            await act(async () => {
                await user.tab();
            });
            jest.advanceTimersByTime(100);

            expect(items[1]).toHaveFocus();
            await act(async () => {
                await user.keyboard("{Escape}");
            });
            jest.advanceTimersByTime(100);

            expect(screen.getByRole("button")).toHaveFocus();
        });
    });
});

function mockColumnSelectorProps(): ColumnSelectorProps {
    return {
        columns: [
            {
                columnId: "1" as ColumnId,
                header: "Test",
                canHide: true
            }
        ] as GridColumn[],
        id: "selector-under-test",
        visibleLength: 1
    };
}
