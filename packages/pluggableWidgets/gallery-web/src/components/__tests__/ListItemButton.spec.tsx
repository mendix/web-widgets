import { ReactElement } from "react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { render, RenderResult } from "@testing-library/react";
import { ListItemButton } from "../ListItemButton";

function setup(jsx: ReactElement): { user: UserEvent } & RenderResult {
    return {
        user: userEvent.setup(),
        ...render(jsx)
    };
}

describe("ListItemButton", () => {
    describe("keyboard interactions with nested input elements", () => {
        it("does not prevent Space key in nested input field", async () => {
            const onClick = jest.fn();
            const { user, getByRole } = setup(
                <ListItemButton onClick={onClick}>
                    <input type="text" />
                </ListItemButton>
            );

            const input = getByRole("textbox") as HTMLInputElement;
            input.focus();
            await user.keyboard(" ");
            await user.keyboard("Hello");
            await user.keyboard(" ");
            await user.keyboard("World");

            expect(input.value).toBe(" Hello World");
            expect(onClick).toHaveBeenCalledTimes(0);
        });

        it("does not prevent Space key in nested textarea field", async () => {
            const onClick = jest.fn();
            const { user, getByRole } = setup(
                <ListItemButton onClick={onClick}>
                    <textarea />
                </ListItemButton>
            );

            const textarea = getByRole("textbox") as HTMLTextAreaElement;
            textarea.focus();
            await user.keyboard("Multi");
            await user.keyboard(" ");
            await user.keyboard("line");
            await user.keyboard(" ");
            await user.keyboard("text");

            expect(textarea.value).toBe("Multi line text");
            expect(onClick).toHaveBeenCalledTimes(0);
        });

        it("does not prevent Enter key in nested input field", async () => {
            const onClick = jest.fn();
            const { user, getByRole } = setup(
                <ListItemButton onClick={onClick}>
                    <input type="text" />
                </ListItemButton>
            );

            const input = getByRole("textbox") as HTMLInputElement;
            input.focus();
            await user.keyboard("Test");
            await user.keyboard("{Enter}");

            // Enter doesn't add to value but shouldn't trigger onClick
            expect(input.value).toBe("Test");
            expect(onClick).toHaveBeenCalledTimes(0);
        });
    });
});
