import { renderHook, act } from "@testing-library/react";
import { useImageCropperState } from "../useImageCropperState";

describe("useImageCropperState", () => {
    test("initializes zoom from arg, grayscale false", () => {
        const { result } = renderHook(() => useImageCropperState(1));
        expect(result.current.zoom).toBe(1);
        expect(result.current.grayscale).toBe(false);
    });

    test("setGrayscale updates state", () => {
        const { result } = renderHook(() => useImageCropperState(1));
        act(() => {
            result.current.setGrayscale(true);
        });
        expect(result.current.grayscale).toBe(true);
    });
});
