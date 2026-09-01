import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { FormEvent } from "react";
import { ActionButton } from "../ActionButton";

jest.mock("../../utils/mx-data", () => ({
    fetchDocumentUrl: jest.fn(),
    fetchImageThumbnail: jest.fn(),
    fetchMxObject: jest.fn(),
    removeObject: jest.fn(),
    saveFile: jest.fn(),
    fileHasContents: jest.fn()
}));

function renderInForm(action: jest.Mock): jest.Mock {
    const onSubmit = jest.fn((e: FormEvent) => e.preventDefault());

    render(
        <form onSubmit={onSubmit}>
            <ActionButton icon={<span />} title="add" action={action} isDisabled={false} />
        </form>
    );

    return onSubmit;
}

describe("ActionButton", () => {
    it("is a native button with an explicit type and no redundant role", () => {
        render(<ActionButton icon={<span />} title="add" action={jest.fn()} isDisabled={false} />);

        const button = screen.getByRole("button", { name: "add" });
        expect(button.tagName).toBe("BUTTON");
        expect(button).toHaveAttribute("type", "button");
        expect(button).not.toHaveAttribute("role");
    });

    it("runs its action without submitting an enclosing form", () => {
        const action = jest.fn();
        const onSubmit = renderInForm(action);

        fireEvent.click(screen.getByRole("button", { name: "add" }));

        expect(action).toHaveBeenCalledTimes(1);
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("does not submit an enclosing form on repeated activation", () => {
        const action = jest.fn();
        const onSubmit = renderInForm(action);

        const button = screen.getByRole("button", { name: "add" });
        fireEvent.click(button);
        fireEvent.click(button);
        fireEvent.click(button);

        expect(action).toHaveBeenCalledTimes(3);
        expect(onSubmit).not.toHaveBeenCalled();
    });
});
