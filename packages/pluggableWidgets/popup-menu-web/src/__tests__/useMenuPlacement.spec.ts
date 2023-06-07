import { renderHook } from "@testing-library/react-hooks";
import { useMenuPlacement } from "../utils/useMenuPlacement";

const positionObserverValues = { top: 10, bottom: 20, left: 30, height: 1, width: 2 };
const usePositionMock = jest.fn(() => positionObserverValues);
jest.mock("@mendix/pluggable-widgets-commons/dist/components/web", () => ({
    usePositionObserver: () => usePositionMock()
}));

describe("Menu Placement", () => {
    it("Returns the styles for position: TOP", () => {
        const anchor = document.createElement("div");

        const { result } = renderHook(() => useMenuPlacement(anchor, "top"));

        expect(result.current).toStrictEqual({
            position: "fixed",
            display: "flex",
            top: positionObserverValues.top,
            left: positionObserverValues.left,
            zIndex: 0
        });
    });

    it("Returns the styles for position: TOP, on a modal", () => {
        const anchor = document.createElement("div");
        const modal = document.createElement("div");
        document.body.appendChild(modal);
        modal.classList.add("modal-dialog");
        modal.style.zIndex = "102";

        const { result } = renderHook(() => useMenuPlacement(anchor, "top"));

        expect(result.current).toStrictEqual({
            position: "fixed",
            display: "flex",
            top: positionObserverValues.top,
            left: positionObserverValues.left,
            zIndex: 103
        });
        document.body.getElementsByClassName("modal-dialog")[0]?.remove();
    });

    it("Returns the styles for position: RIGHT", () => {
        const anchor = document.createElement("div");

        const { result } = renderHook(() => useMenuPlacement(anchor, "right"));

        expect(result.current).toStrictEqual({
            position: "fixed",
            display: "flex",
            top: positionObserverValues.top,
            left: positionObserverValues.left + positionObserverValues.width,
            transform: "none",
            bottom: "initial",
            zIndex: 0
        });
    });
    it("Returns the styles for position: BOTTOM", () => {
        const anchor = document.createElement("div");

        const { result } = renderHook(() => useMenuPlacement(anchor, "bottom"));

        expect(result.current).toStrictEqual({
            position: "fixed",
            display: "flex",
            top: positionObserverValues.height + positionObserverValues.top,
            left: positionObserverValues.left,
            transform: "none",
            bottom: "initial",
            zIndex: 0
        });
    });
    it("Returns the styles for position: LEFT", () => {
        const anchor = document.createElement("div");

        const { result } = renderHook(() => useMenuPlacement(anchor, "left"));

        expect(result.current).toStrictEqual({
            position: "fixed",
            display: "flex",
            top: positionObserverValues.top,
            left: positionObserverValues.left,
            zIndex: 0
        });
    });
});
