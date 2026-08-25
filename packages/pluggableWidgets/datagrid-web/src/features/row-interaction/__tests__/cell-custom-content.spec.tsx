import { render, RenderResult, screen } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { ObjectItem } from "mendix";
import { ClickTrigger } from "@mendix/widget-plugin-grid/helpers/ClickActionHelper";
import { objectItems } from "@mendix/widget-plugin-test-utils";
import { CellContext, SelectionMethod } from "../base";
import { CellEventsController } from "../CellEventsController";

interface Setup {
    executeAction: jest.Mock;
    select: jest.Mock;
    item: ObjectItem;
    user: UserEvent;
}

/**
 * Renders a cell with the DOM a custom content column produces: the cell handlers
 * on the `.td` and a checkbox with its own label inside `.td-custom-content`.
 */
function setup(
    clickTrigger: ClickTrigger,
    selectionMethod: SelectionMethod = "none"
): Setup & Omit<RenderResult, "container"> {
    const executeAction = jest.fn();
    const select = jest.fn();
    const [item] = objectItems(1);

    const controller = new CellEventsController(
        (): CellContext => ({
            type: "cell",
            item,
            pageSize: 10,
            selectionMethod,
            selectionType: selectionMethod === "none" ? "None" : "Single",
            selectionMode: "clear",
            clickTrigger
        }),
        select,
        jest.fn(),
        jest.fn(),
        executeAction,
        jest.fn()
    );

    const { container: _container, ...result } = render(
        <div role="gridcell" className="td" {...controller.getProps(item)}>
            <div className="td-custom-content">
                <label htmlFor="cb">Toggle</label>
                <input id="cb" type="checkbox" />
            </div>
        </div>
    );

    return { executeAction, select, item, user: userEvent.setup(), ...result };
}

describe("grid cell with custom content", () => {
    describe("when the click trigger is double", () => {
        it("does not execute the action when the label of a checkbox is clicked once", async () => {
            // Clicking a label makes the browser forward a click to the checkbox.
            // Both clicks bubble to the cell, but they are one gesture.
            const { user, executeAction } = setup("double");

            await user.click(screen.getByText("Toggle"));

            expect(executeAction).toHaveBeenCalledTimes(0);
        });

        it("does not execute the action when the checkbox itself is clicked once", async () => {
            const { user, executeAction } = setup("double");

            await user.click(screen.getByRole("checkbox"));

            expect(executeAction).toHaveBeenCalledTimes(0);
        });

        it("executes the action once when the label is double clicked", async () => {
            const { user, executeAction } = setup("double");

            await user.dblClick(screen.getByText("Toggle"));

            expect(executeAction).toHaveBeenCalledTimes(1);
        });
    });

    describe("when the click trigger is single", () => {
        it("executes the action once when the label of a checkbox is clicked", async () => {
            const { user, executeAction } = setup("single");

            await user.click(screen.getByText("Toggle"));

            expect(executeAction).toHaveBeenCalledTimes(1);
        });

        it("executes the action once when the checkbox itself is clicked", async () => {
            const { user, executeAction } = setup("single");

            await user.click(screen.getByRole("checkbox"));

            expect(executeAction).toHaveBeenCalledTimes(1);
        });
    });

    describe("when rows are selected by click", () => {
        it("selects once when the label of a checkbox is clicked", async () => {
            const { user, select } = setup("none", "rowClick");

            await user.click(screen.getByText("Toggle"));

            expect(select).toHaveBeenCalledTimes(1);
        });
    });

    it("keeps toggling the checkbox", async () => {
        const { user } = setup("double");

        await user.click(screen.getByText("Toggle"));

        expect(screen.getByRole("checkbox")).toBeChecked();
    });
});
