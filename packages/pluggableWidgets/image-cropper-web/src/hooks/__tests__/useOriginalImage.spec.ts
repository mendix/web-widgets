import { renderHook, act, waitFor } from "@testing-library/react";
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

    test("markInternalChange skips recapture on next uri change and preserves original File", async () => {
        const blob1 = new Blob(["original"], { type: "image/png" });
        const blob2 = new Blob(["baked"], { type: "image/png" });
        const fetchMock = jest.fn().mockResolvedValueOnce({ ok: true, blob: () => Promise.resolve(blob1) });
        global.fetch = fetchMock as jest.Mock;

        const { result, rerender } = renderHook(({ uri }) => useOriginalImage(uri, "img.png"), {
            initialProps: { uri: "http://localhost/original.png" }
        });
        await waitFor(() => expect(result.current.canRestore).toBe(true));
        const originalFile = result.current.getOriginal();
        expect(originalFile).toBeInstanceOf(File);

        // Simulate an internal bake: mark then change uri
        fetchMock.mockResolvedValueOnce({ ok: true, blob: () => Promise.resolve(blob2) });
        act(() => {
            result.current.markInternalChange();
        });
        rerender({ uri: "http://localhost/baked.png" });

        // fetch must NOT have been called a second time
        await waitFor(() => {
            // give the effect a tick to potentially run
        });
        expect(fetchMock).toHaveBeenCalledTimes(1);
        // original File is preserved
        expect(result.current.getOriginal()).toBe(originalFile);
        expect(result.current.canRestore).toBe(true);
    });
});
