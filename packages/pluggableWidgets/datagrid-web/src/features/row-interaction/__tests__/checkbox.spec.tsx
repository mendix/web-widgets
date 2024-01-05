import { createElement } from "react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { render, renderHook, RenderResult } from "@testing-library/react";
import { objectItems } from "@mendix/widget-plugin-test-utils";
import { useEventSwitch } from "@mendix/widget-plugin-grid/event-switch/use-event-switch";
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
        const props = renderHook(() =>
            useEventSwitch<CheckboxContext, HTMLInputElement>(
                () => ({
                    item,
                    selectionMethod: "checkbox"
                }),
                () => checkboxHandlers(onSelect)
            )
        ).result.current;

        const { user, getByRole } = setup(<input type="checkbox" {...props} />);
        await user.click(getByRole("checkbox"));

        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect).toHaveBeenLastCalledWith(item, false);
    });
    test("on shift+click event calls onSelect", async () => {
        const onSelect = jest.fn();
        const [item] = objectItems(1);
        const props = renderHook(() =>
            useEventSwitch<CheckboxContext, HTMLInputElement>(
                () => ({
                    item,
                    selectionMethod: "checkbox"
                }),
                () => checkboxHandlers(onSelect)
            )
        ).result.current;

        const { user, getByRole } = setup(<input type="checkbox" {...props} />);
        await user.keyboard("{Shift>}");
        await user.click(getByRole("checkbox"));
        await user.keyboard("{/Shift}");

        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect).toHaveBeenLastCalledWith(item, true);
    });
    test("on keyup{Space} event calls onSelect", async () => {
        const onSelect = jest.fn();
        const [item] = objectItems(1);
        const props = renderHook(() =>
            useEventSwitch<CheckboxContext, HTMLInputElement>(
                () => ({
                    item,
                    selectionMethod: "checkbox"
                }),
                () => checkboxHandlers(onSelect)
            )
        ).result.current;

        const { user } = setup(<input type="checkbox" {...props} />);
        await user.tab();
        await user.keyboard("[Space]");

        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect).toHaveBeenLastCalledWith(item, false);
    });
});
