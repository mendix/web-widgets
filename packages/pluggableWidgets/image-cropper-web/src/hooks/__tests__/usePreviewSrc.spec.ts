import { renderHook, act } from "@testing-library/react";
import { usePreviewSrc } from "../usePreviewSrc";

describe("usePreviewSrc", () => {
    // jsdom doesn't implement these; define no-op stubs so we can spy on them.
    if (!URL.createObjectURL) {
        (URL as unknown as { createObjectURL: () => string }).createObjectURL = () => "";
    }
    if (!URL.revokeObjectURL) {
        (URL as unknown as { revokeObjectURL: () => void }).revokeObjectURL = () => undefined;
    }
    const createSpy = jest.spyOn(URL, "createObjectURL");
    const revokeSpy = jest.spyOn(URL, "revokeObjectURL");

    beforeEach(() => {
        let n = 0;
        createSpy.mockImplementation(() => `blob:mock-${++n}`);
        revokeSpy.mockImplementation(() => undefined);
    });
    afterEach(() => jest.clearAllMocks());

    const file = (): File => new File(["x"], "r.png", { type: "image/png" });

    test("previewSrc is undefined initially", () => {
        const { result } = renderHook(({ uri }) => usePreviewSrc(uri), { initialProps: { uri: "http://x/a.png" } });
        expect(result.current.previewSrc).toBeUndefined();
    });

    test("showPreview creates a blob URL and exposes it", () => {
        const { result } = renderHook(({ uri }) => usePreviewSrc(uri), { initialProps: { uri: "http://x/a.png" } });
        act(() => result.current.showPreview(file()));
        expect(result.current.previewSrc).toBe("blob:mock-1");
        expect(createSpy).toHaveBeenCalledTimes(1);
    });

    test("showPreview revokes the prior blob before creating a new one", () => {
        const { result } = renderHook(({ uri }) => usePreviewSrc(uri), { initialProps: { uri: "http://x/a.png" } });
        act(() => result.current.showPreview(file()));
        act(() => result.current.showPreview(file()));
        expect(revokeSpy).toHaveBeenCalledWith("blob:mock-1");
        expect(result.current.previewSrc).toBe("blob:mock-2");
    });

    test("changing committed uri drops the preview and revokes the blob", () => {
        const { result, rerender } = renderHook(({ uri }) => usePreviewSrc(uri), {
            initialProps: { uri: "http://x/a.png" }
        });
        act(() => result.current.showPreview(file()));
        expect(result.current.previewSrc).toBe("blob:mock-1");
        rerender({ uri: "http://x/b.png" });
        expect(revokeSpy).toHaveBeenCalledWith("blob:mock-1");
        expect(result.current.previewSrc).toBeUndefined();
    });

    test("revokes the blob on unmount", () => {
        const { result, unmount } = renderHook(({ uri }) => usePreviewSrc(uri), {
            initialProps: { uri: "http://x/a.png" }
        });
        act(() => result.current.showPreview(file()));
        unmount();
        expect(revokeSpy).toHaveBeenCalledWith("blob:mock-1");
    });
});
