import { act, renderHook } from "@testing-library/react-hooks";
import { configure, isObservable, observable } from "mobx";
import { useSubscribe } from "../src/react/useSubscribe";

describe("useSubscribe", () => {
    configure({
        enforceActions: "never"
    });

    it("should initialize with the correct value", () => {
        const store = observable({ count: 0 });
        const { result } = renderHook(() => useSubscribe(store, s => s.count));

        const [value, returnedStore] = result.current;
        expect(value).toBe(0);
        expect(returnedStore).toBe(store);
    });

    it("should call init function, if given", () => {
        const { result } = renderHook(() =>
            useSubscribe(
                () => observable({ count: 0 }),
                s => s.count
            )
        );

        const [value, store] = result.current;
        expect(value).toBe(0);
        expect(isObservable(store)).toBe(true);
    });

    it("should update the value when the observable changes", () => {
        const store = observable({ count: 0 });
        const { result } = renderHook(() => useSubscribe(store, s => s.count));

        act(() => {
            store.count = 1;
        });

        const [value] = result.current;
        expect(value).toBe(1);
    });

    it("should clean up the reaction on unmount", () => {
        const store = observable({ count: 0 });
        const selector = jest.fn(s => s.count);
        const { unmount } = renderHook(() => useSubscribe(() => store, selector));

        expect(selector).toHaveBeenCalledTimes(2);

        act(() => {
            ++store.count;
        });

        expect(selector).toHaveBeenCalledTimes(3);

        unmount();

        act(() => {
            ++store.count;
        });

        expect(selector).toHaveBeenCalledTimes(3);
    });
});
