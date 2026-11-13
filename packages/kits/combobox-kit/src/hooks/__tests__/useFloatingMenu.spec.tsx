import { autoUpdate } from "@floating-ui/react";
import { act, render } from "@testing-library/react";
import { ReactElement } from "react";
import { useFloatingMenu } from "../useFloatingMenu";

jest.mock("@floating-ui/react", () => ({
    ...jest.requireActual("@floating-ui/react"),
    autoUpdate: jest.fn()
}));

function Menu({ open }: { open: boolean }): ReactElement {
    const { refs } = useFloatingMenu(open);
    return (
        <div ref={refs.setReference}>
            <div ref={refs.setFloating} />
        </div>
    );
}

async function renderMenu(open: boolean): Promise<ReturnType<typeof render>> {
    const result = render(<Menu open={open} />);
    await act(async () => {});
    return result;
}

describe("useFloatingMenu", () => {
    const autoUpdateMock = autoUpdate as jest.MockedFunction<typeof autoUpdate>;
    const cleanup = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        autoUpdateMock.mockReturnValue(cleanup);
    });

    it("does not track position while closed", async () => {
        await renderMenu(false);

        expect(autoUpdateMock).not.toHaveBeenCalled();
    });

    it("tracks position on open and stops on close", async () => {
        const { rerender } = await renderMenu(false);

        rerender(<Menu open />);
        await act(async () => {});
        expect(autoUpdateMock).toHaveBeenCalledTimes(1);
        expect(cleanup).not.toHaveBeenCalled();

        rerender(<Menu open={false} />);
        await act(async () => {});
        expect(cleanup).toHaveBeenCalledTimes(1);
        expect(autoUpdateMock).toHaveBeenCalledTimes(1);
    });

    it("tracks position again when reopened", async () => {
        const { rerender } = await renderMenu(true);

        rerender(<Menu open={false} />);
        await act(async () => {});
        rerender(<Menu open />);
        await act(async () => {});

        expect(autoUpdateMock).toHaveBeenCalledTimes(2);
    });

    it("stops tracking on unmount", async () => {
        const { unmount } = await renderMenu(true);

        unmount();

        expect(cleanup).toHaveBeenCalledTimes(1);
    });
});
