import { renderHook, act } from "@testing-library/react";
import { useImageCropperState } from "../useImageCropperState";

describe("useImageCropperState", () => {
    test("initializes zoom from arg, rotation 0, grayscale false", () => {
        const { result } = renderHook(() => useImageCropperState(1));
        expect(result.current.zoom).toBe(1);
        expect(result.current.rotation).toBe(0);
        expect(result.current.grayscale).toBe(false);
    });

    test("setRotation and setGrayscale update state", () => {
        const { result } = renderHook(() => useImageCropperState(1));
        act(() => {
            result.current.setRotation(90);
            result.current.setGrayscale(true);
        });
        expect(result.current.rotation).toBe(90);
        expect(result.current.grayscale).toBe(true);
    });
});
