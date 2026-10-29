import { renderHook, act } from "@testing-library/react";
import { makeObservable, observable, runInAction } from "mobx";
import { useObservableSnapshot } from "../useObservableSnapshot";

class Store {
    term = "";
    other = 0;

    constructor() {
        makeObservable(this, { term: observable, other: observable });
    }
}

describe("useObservableSnapshot", () => {
    it("returns the current value and re-renders once per change", () => {
        const store = new Store();
        let renders = 0;
        const read = (): string => store.term;
        const { result } = renderHook(() => {
            renders++;
            return useObservableSnapshot(read);
        });
        expect(result.current).toBe("");
        const before = renders;

        act(() => runInAction(() => (store.term = "a")));

        expect(result.current).toBe("a");
        expect(renders).toBe(before + 1);
    });

    it("ignores observables the read function does not touch", () => {
        const store = new Store();
        let renders = 0;
        const read = (): string => store.term;
        renderHook(() => {
            renders++;
            return useObservableSnapshot(read);
        });
        const before = renders;

        act(() => runInAction(() => (store.other = 1)));

        expect(renders).toBe(before);
    });

    it("stops listening after unmount", () => {
        const store = new Store();
        let renders = 0;
        const read = (): string => store.term;
        const { unmount } = renderHook(() => {
            renders++;
            return useObservableSnapshot(read);
        });
        unmount();
        const before = renders;

        act(() => runInAction(() => (store.term = "a")));

        expect(renders).toBe(before);
    });
});
