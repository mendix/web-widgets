import { renderHook } from "@testing-library/react";
import { useMenuPlacement } from "../utils/useMenuPlacement";

const positionObserverValues = { top: 670, bottom: 700, left: 900, height: 40, width: 120, x: 900, y: 70 };
const usePositionMock = jest.fn(() => positionObserverValues);
jest.mock("@mendix/widget-plugin-hooks/usePositionObserver", () => ({
    usePositionObserver: () => usePositionMock()
}));

describe("Menu Placement", () => {
    it("Returns the styles for position: TOP", () => {
        const anchor = document.createElement("div");

        const { result } = renderHook(() => useMenuPlacement(anchor, "top"));

        expect(result.current).toStrictEqual({
            position: "absolute",
            display: "flex",
            top: 0,
            left: 0,
            zIndex: 1
        });
    });

    it("Returns the styles for position: RIGHT", () => {
        const anchor = document.createElement("div");

        const { result } = renderHook(() => useMenuPlacement(anchor, "right"));

        expect(result.current).toStrictEqual({
            position: "absolute",
            display: "flex",
            top: 0,
            left: positionObserverValues.width,
            transform: "none",
            right: "initial",
            zIndex: 1
        });
    });
    it("Returns the styles for position: BOTTOM", () => {
        const anchor = document.createElement("div");

        const { result } = renderHook(() => useMenuPlacement(anchor, "bottom"));

        expect(result.current).toStrictEqual({
            position: "absolute",
            display: "flex",
            top: positionObserverValues.height,
            left: 0,
            transform: "none",
            bottom: "initial",
            zIndex: 1
        });
    });
    it("Returns the styles for position: LEFT", () => {
        const anchor = document.createElement("div");

        const { result } = renderHook(() => useMenuPlacement(anchor, "left"));

        expect(result.current).toStrictEqual({
            position: "absolute",
            display: "flex",
            top: 0,
            left: 0,
            zIndex: 1
        });
    });
});
