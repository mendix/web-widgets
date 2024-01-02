import { createElement } from "react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { render, renderHook, RenderResult } from "@testing-library/react";
import { useEventSwitch } from "../use-event-switch";
import { createActionHandlers } from "../action-handlers";

function setup(jsx: React.ReactElement): { user: UserEvent } & RenderResult {
    return {
        user: userEvent.setup(),
        ...render(jsx)
    };
}

describe("grid cell", () => {
    describe("on click event", () => {
        const cases = [
            { ct: "single", sm: "rowClick", method: "none" },
            { ct: "double", sm: "rowClick", method: "onSelect" },
            { ct: "none", sm: "rowClick", method: "onSelect" },
            { ct: "single", sm: "checkbox", method: "onExecuteAction" },
            { ct: "double", sm: "checkbox", method: "none" },
            { ct: "none", sm: "checkbox", method: "none" },
            { ct: "single", sm: "none", method: "onExecuteAction" },
            { ct: "double", sm: "none", method: "none" },
            { ct: "none", sm: "none", method: "none" }
        ];

        test.each(cases)(
            "calls $method when selection method is $sm and click trigger is $ct",
            async ({ ct: _clickTrigger, sm: _selectionMethod, method }) => {
                const onExecuteAction = jest.fn();
                const onSelect = jest.fn();
                const props = renderHook(() =>
                    useEventSwitch<"div", unknown>(() => ({}), [...createActionHandlers(onExecuteAction)])
                ).result.current;

                const { user, getByRole } = setup(<div role="gridcell" {...props} />);
                await user.click(getByRole("gridcell"));

                if (method === "none") {
                    expect(onExecuteAction).toHaveBeenCalledTimes(0);
                    expect(onSelect).toHaveBeenCalledTimes(0);
                } else if (method === "onSelect") {
                    expect(onExecuteAction).toHaveBeenCalledTimes(0);
                    expect(onSelect).toHaveBeenCalledTimes(1);
                } else {
                    expect(onExecuteAction).toHaveBeenCalledTimes(1);
                    expect(onSelect).toHaveBeenCalledTimes(0);
                }
            }
        );
    });
});
