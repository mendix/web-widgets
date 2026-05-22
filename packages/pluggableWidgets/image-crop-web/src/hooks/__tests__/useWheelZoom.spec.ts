import { renderHook, act } from "@testing-library/react";
import type { WheelEvent } from "react";
import { useWheelZoom } from "../useWheelZoom";

function makeWheelEvent(deltaY: number, ctrlKey = false): WheelEvent {
    return {
        deltaY,
        ctrlKey,
        metaKey: false,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
    } as unknown as WheelEvent;
}

describe("useWheelZoom", () => {
    test("mode 'off' does nothing", () => {
        const setZoom = jest.fn();
        const { result } = renderHook(() => useWheelZoom({ mode: "off", zoom: 1, minZoom: 1, maxZoom: 4, setZoom }));
        const e = makeWheelEvent(-100);
        act(() => result.current(e));
        expect(setZoom).not.toHaveBeenCalled();
        expect(e.preventDefault).not.toHaveBeenCalled();
    });

    test("mode 'on' zooms in on negative deltaY", () => {
        const setZoom = jest.fn();
        const { result } = renderHook(() => useWheelZoom({ mode: "on", zoom: 1, minZoom: 1, maxZoom: 4, setZoom }));
        const e = makeWheelEvent(-100);
        act(() => result.current(e));
        expect(setZoom).toHaveBeenCalledWith(1.1);
        expect(e.preventDefault).toHaveBeenCalled();
    });

    test("mode 'on' zooms out on positive deltaY", () => {
        const setZoom = jest.fn();
        const { result } = renderHook(() => useWheelZoom({ mode: "on", zoom: 2, minZoom: 1, maxZoom: 4, setZoom }));
        act(() => result.current(makeWheelEvent(100)));
        expect(setZoom).toHaveBeenCalledWith(1.8);
    });

    test("mode 'onWithCtrl' ignores wheel without Ctrl/Meta", () => {
        const setZoom = jest.fn();
        const { result } = renderHook(() =>
            useWheelZoom({ mode: "onWithCtrl", zoom: 1, minZoom: 1, maxZoom: 4, setZoom })
        );
        const e = makeWheelEvent(-100, false);
        act(() => result.current(e));
        expect(setZoom).not.toHaveBeenCalled();
        expect(e.preventDefault).not.toHaveBeenCalled();
    });

    test("mode 'onWithCtrl' zooms when Ctrl is held", () => {
        const setZoom = jest.fn();
        const { result } = renderHook(() =>
            useWheelZoom({ mode: "onWithCtrl", zoom: 1, minZoom: 1, maxZoom: 4, setZoom })
        );
        const e = makeWheelEvent(-100, true);
        act(() => result.current(e));
        expect(setZoom).toHaveBeenCalledWith(1.1);
        expect(e.preventDefault).toHaveBeenCalled();
    });

    test("clamps to maxZoom", () => {
        const setZoom = jest.fn();
        const { result } = renderHook(() => useWheelZoom({ mode: "on", zoom: 4, minZoom: 1, maxZoom: 4, setZoom }));
        act(() => result.current(makeWheelEvent(-100)));
        expect(setZoom).toHaveBeenCalledWith(4);
    });

    test("clamps to minZoom", () => {
        const setZoom = jest.fn();
        const { result } = renderHook(() => useWheelZoom({ mode: "on", zoom: 1, minZoom: 1, maxZoom: 4, setZoom }));
        act(() => result.current(makeWheelEvent(100)));
        expect(setZoom).toHaveBeenCalledWith(1);
    });
});
