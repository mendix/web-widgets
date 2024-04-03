import { createElement } from "react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { render, RenderResult, fireEvent } from "@testing-library/react";
import { objectItems } from "@mendix/widget-plugin-test-utils";
import { eventSwitch } from "@mendix/widget-plugin-grid/event-switch/event-switch";
import { CheckboxContext } from "../base";
import { checkboxHandlers } from "../checkbox-handlers";

function setup(jsx: React.ReactElement): { user: UserEvent } & RenderResult {
    return {
        user: userEvent.setup(),
        ...render(jsx)
    };
}

describe("'select row' checkbox", () => {
    test("on click event calls onSelect", async () => {
        const onSelect = jest.fn();
        const [item] = objectItems(1);
        const props = eventSwitch<CheckboxContext, HTMLInputElement>(
            () => ({
                item,
                pageSize: 10,
                selectionType: "Single",
                selectionMode: "clear",
                selectionMethod: "checkbox"
            }),
            [...checkboxHandlers(onSelect, jest.fn(), jest.fn())]
        );

        const { user, getByRole } = setup(<input type="checkbox" {...props} />);
        await user.click(getByRole("checkbox"));

        expect(onSelect).toHaveBeenCalledTimes(1);
    });

    test("on shift+click event calls onSelect", async () => {
        const onSelect = jest.fn();
        const [item] = objectItems(1);
        const props = eventSwitch<CheckboxContext, HTMLInputElement>(
            () => ({
                item,
                pageSize: 10,
                selectionType: "Single",
                selectionMode: "clear",
                selectionMethod: "checkbox"
            }),
            [...checkboxHandlers(onSelect, jest.fn(), jest.fn())]
        );

        const { user, getByRole } = setup(<input type="checkbox" {...props} />);
        await user.keyboard("{Shift>}");
        await user.click(getByRole("checkbox"));
        await user.keyboard("{/Shift}");

        expect(onSelect).toHaveBeenCalledTimes(1);
    });

    test("on keyup[Space] event calls onSelect", async () => {
        const onSelect = jest.fn();
        const [item] = objectItems(1);
        const props = eventSwitch<CheckboxContext, HTMLInputElement>(
            () => ({
                item,
                pageSize: 10,
                selectionType: "Single",
                selectionMode: "clear",
                selectionMethod: "checkbox"
            }),
            [...checkboxHandlers(onSelect, jest.fn(), jest.fn())]
        );
        const { user } = setup(<input type="checkbox" {...props} />);
        await user.tab();
        await user.keyboard("[Space]");

        expect(onSelect).toHaveBeenCalledTimes(1);
    });

    test("on keydown[ControlLeft+KeyA] event calls onSelectAll when selection type Multi", async () => {
        const onSelectAll = jest.fn();
        const [item] = objectItems(1);
        const props = eventSwitch<CheckboxContext, HTMLInputElement>(
            () => ({
                item,
                pageSize: 10,
                selectionType: "Multi",
                selectionMode: "clear",
                selectionMethod: "checkbox"
            }),
            [...checkboxHandlers(jest.fn(), onSelectAll, jest.fn())]
        );
        const { user } = setup(<input type="checkbox" {...props} />);
        await user.tab();
        await user.keyboard("[ControlLeft>]a[/ControlLeft]");

        expect(onSelectAll).toHaveBeenCalledTimes(1);
    });

    test("on keydown[MetaLeft+KeyA] event calls onSelectAll when selection type Multi", async () => {
        const onSelectAll = jest.fn();
        const [item] = objectItems(1);
        const props = eventSwitch<CheckboxContext, HTMLInputElement>(
            () => ({
                item,
                pageSize: 10,
                selectionType: "Multi",
                selectionMode: "clear",
                selectionMethod: "checkbox"
            }),
            [...checkboxHandlers(jest.fn(), onSelectAll, jest.fn())]
        );
        const { user } = setup(<input type="checkbox" {...props} />);
        await user.tab();
        await user.keyboard("[MetaLeft>]a[/MetaLeft]");

        expect(onSelectAll).toHaveBeenCalledTimes(1);
    });

    test("on shift+keyup[ArrowUp|ArrowDown|PageUp|PageDown] event calls onSelectAdjacent", async () => {
        const onSelectAdjacent = jest.fn();
        const [item] = objectItems(1);
        const props = eventSwitch<CheckboxContext, HTMLInputElement>(
            () => ({
                item,
                pageSize: 10,
                selectionType: "Multi",
                selectionMode: "clear",
                selectionMethod: "checkbox"
            }),
            [...checkboxHandlers(jest.fn(), jest.fn(), onSelectAdjacent)]
        );
        const { user, getByRole } = setup(<input type="checkbox" {...props} />);
        await user.tab();

        await user.keyboard("{Shift>}[ArrowUp]{/Shift}");
        expect(onSelectAdjacent).toHaveBeenCalledTimes(1);
        expect(onSelectAdjacent).toHaveBeenLastCalledWith(item, true, "clear", { direction: "backward", size: 1 });

        await user.keyboard("{Shift>}[ArrowDown]{/Shift}");
        expect(onSelectAdjacent).toHaveBeenCalledTimes(2);
        expect(onSelectAdjacent).toHaveBeenLastCalledWith(item, true, "clear", { direction: "forward", size: 1 });
        // PageUp/PageDown broken in userEvents v14.5.1
        // So, fallback to fireEvent
        fireEvent.keyDown(getByRole("checkbox"), { code: "PageUp", shiftKey: true });
        expect(onSelectAdjacent).toHaveBeenCalledTimes(3);
        expect(onSelectAdjacent).toHaveBeenLastCalledWith(item, true, "clear", { direction: "backward", size: 10 });

        fireEvent.keyDown(getByRole("checkbox"), { code: "PageDown", shiftKey: true });
        expect(onSelectAdjacent).toHaveBeenCalledTimes(4);
        expect(onSelectAdjacent).toHaveBeenLastCalledWith(item, true, "clear", { direction: "forward", size: 10 });
    });
});
