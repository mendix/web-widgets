import { renderHook, act } from "@testing-library/react";
import { useZoomScale } from "../useZoomScale";

describe("useZoomScale", () => {
    it("starts at a zoom level of 1", () => {
        const { result } = renderHook(() => useZoomScale());

        expect(result.current.zoomLevel).toBe(1);
    });

    it("zooms in by a factor of 1.2", () => {
        const { result } = renderHook(() => useZoomScale());

        act(() => result.current.zoomIn());

        expect(result.current.zoomLevel).toBeCloseTo(1.2);
    });

    it("zooms out by a factor of 0.8", () => {
        const { result } = renderHook(() => useZoomScale());

        act(() => result.current.zoomOut());

        expect(result.current.zoomLevel).toBeCloseTo(0.8);
    });

    it("does not zoom in beyond the maximum of 10", () => {
        const { result } = renderHook(() => useZoomScale());

        act(() => {
            for (let i = 0; i < 50; i++) {
                result.current.zoomIn();
            }
        });

        expect(result.current.zoomLevel).toBe(10);
    });

    it("does not zoom out below the minimum of 0.3", () => {
        const { result } = renderHook(() => useZoomScale());

        act(() => {
            for (let i = 0; i < 50; i++) {
                result.current.zoomOut();
            }
        });

        expect(result.current.zoomLevel).toBe(0.3);
    });

    it("resets the zoom level back to 1", () => {
        const { result } = renderHook(() => useZoomScale());

        act(() => result.current.zoomIn());
        act(() => result.current.reset());

        expect(result.current.zoomLevel).toBe(1);
    });
});
