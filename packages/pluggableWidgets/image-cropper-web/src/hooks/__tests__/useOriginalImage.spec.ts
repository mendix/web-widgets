import { renderHook, waitFor } from "@testing-library/react";
import { useOriginalImage } from "../useOriginalImage";

describe("useOriginalImage", () => {
    afterEach(() => jest.restoreAllMocks());

    test("captures a File from the uri and reports canRestore", async () => {
        const blob = new Blob(["x"], { type: "image/png" });
        global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(blob) }) as jest.Mock;
        const { result } = renderHook(() => useOriginalImage("http://localhost/img.png", "img.png"));
        await waitFor(() => expect(result.current.canRestore).toBe(true));
        const file = result.current.getOriginal();
        expect(file).toBeInstanceOf(File);
        expect(file!.name).toBe("img.png");
    });

    test("canRestore false when fetch fails", async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error("CORS")) as jest.Mock;
        const { result } = renderHook(() => useOriginalImage("http://x/y.png", "y.png"));
        await waitFor(() => expect(result.current.canRestore).toBe(false));
        expect(result.current.getOriginal()).toBeUndefined();
    });

    test("no fetch when uri is undefined", () => {
        global.fetch = jest.fn() as jest.Mock;
        renderHook(() => useOriginalImage(undefined, undefined));
        expect(global.fetch).not.toHaveBeenCalled();
    });
});
