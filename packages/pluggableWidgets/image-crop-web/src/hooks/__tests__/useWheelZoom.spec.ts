import { renderHook, act } from "@testing-library/react";
import { useWheelZoom } from "../useWheelZoom";

function makeWheelEvent(deltaY: number, ctrlKey = false): globalThis.WheelEvent {
    return new globalThis.WheelEvent("wheel", { deltaY, ctrlKey, bubbles: true, cancelable: true });
}

function makeSetZoom(initial: number): { setZoom: jest.Mock; getZoom: () => number } {
    let current = initial;
    const setZoom = jest.fn((updater: ((prev: number) => number) | number) => {
        current = typeof updater === "function" ? updater(current) : updater;
    });
    return { setZoom, getZoom: () => current };
}

describe("useWheelZoom", () => {
    test("mode 'off' does nothing", () => {
        const { setZoom } = makeSetZoom(1);
        const { result } = renderHook(() => useWheelZoom({ mode: "off", minZoom: 1, maxZoom: 4, setZoom }));
        const e = makeWheelEvent(-100);
        const spy = jest.spyOn(e, "preventDefault");
        act(() => result.current(e));
        expect(setZoom).not.toHaveBeenCalled();
        expect(spy).not.toHaveBeenCalled();
    });

    test("mode 'on' zooms in on negative deltaY", () => {
        const { setZoom, getZoom } = makeSetZoom(1);
        const { result } = renderHook(() => useWheelZoom({ mode: "on", minZoom: 1, maxZoom: 4, setZoom }));
        const e = makeWheelEvent(-100);
        const spy = jest.spyOn(e, "preventDefault");
        act(() => result.current(e));
        expect(getZoom()).toBe(1.1);
        expect(spy).toHaveBeenCalled();
    });

    test("mode 'on' zooms out on positive deltaY", () => {
        const { setZoom, getZoom } = makeSetZoom(2);
        const { result } = renderHook(() => useWheelZoom({ mode: "on", minZoom: 1, maxZoom: 4, setZoom }));
        act(() => result.current(makeWheelEvent(100)));
        expect(getZoom()).toBe(1.8);
    });

    test("mode 'onWithCtrl' ignores wheel without Ctrl/Meta", () => {
        const { setZoom } = makeSetZoom(1);
        const { result } = renderHook(() => useWheelZoom({ mode: "onWithCtrl", minZoom: 1, maxZoom: 4, setZoom }));
        const e = makeWheelEvent(-100, false);
        const spy = jest.spyOn(e, "preventDefault");
        act(() => result.current(e));
        expect(setZoom).not.toHaveBeenCalled();
        expect(spy).not.toHaveBeenCalled();
    });

    test("mode 'onWithCtrl' zooms when Ctrl is held", () => {
        const { setZoom, getZoom } = makeSetZoom(1);
        const { result } = renderHook(() => useWheelZoom({ mode: "onWithCtrl", minZoom: 1, maxZoom: 4, setZoom }));
        const e = makeWheelEvent(-100, true);
        const spy = jest.spyOn(e, "preventDefault");
        act(() => result.current(e));
        expect(getZoom()).toBe(1.1);
        expect(spy).toHaveBeenCalled();
    });

    test("clamps to maxZoom", () => {
        const { setZoom, getZoom } = makeSetZoom(4);
        const { result } = renderHook(() => useWheelZoom({ mode: "on", minZoom: 1, maxZoom: 4, setZoom }));
        act(() => result.current(makeWheelEvent(-100)));
        expect(getZoom()).toBe(4);
    });

    test("clamps to minZoom", () => {
        const { setZoom, getZoom } = makeSetZoom(1);
        const { result } = renderHook(() => useWheelZoom({ mode: "on", minZoom: 1, maxZoom: 4, setZoom }));
        act(() => result.current(makeWheelEvent(100)));
        expect(getZoom()).toBe(1);
    });
});
