import { act, fireEvent, render, RenderResult } from "@testing-library/react";
import { computed, observable, runInAction } from "mobx";
import { TopHorizontalScrollbar } from "../TopHorizontalScrollbar";

const mockStore = { gridContainerRef: { current: null as HTMLDivElement | null } };
const mockLayout = observable.box("200px 800px");
const mockStyle = computed(() => ({ "--widgets-grid-template-columns": mockLayout.get() }));

jest.mock("../../model/hooks/injection-hooks", () => ({
    useGridSizeStore: () => mockStore,
    useGridStyle: () => mockStyle
}));

describe("TopHorizontalScrollbar", () => {
    let content: HTMLDivElement;
    let grid: HTMLDivElement;
    let resize: ResizeObserverCallback;
    const disconnect = jest.fn();

    beforeEach(() => {
        jest.useFakeTimers();
        runInAction(() => mockLayout.set("200px 800px"));
        content = document.createElement("div");
        content.className = "widget-datagrid-content";
        grid = document.createElement("div");
        content.append(grid);
        document.body.append(content);
        mockStore.gridContainerRef.current = grid;
        Object.defineProperties(content, {
            clientWidth: { configurable: true, value: 400 },
            scrollWidth: { configurable: true, value: 1000 }
        });
        global.ResizeObserver = jest.fn().mockImplementation(callback => {
            resize = callback;
            return { observe: jest.fn(), disconnect };
        });
        disconnect.mockClear();
    });

    afterEach(() => {
        content.remove();
        jest.useRealTimers();
    });

    function mount(): RenderResult & { top: HTMLDivElement; spacer: HTMLDivElement } {
        const result = render(<TopHorizontalScrollbar />);
        const top = result.container.firstElementChild as HTMLDivElement;
        Object.defineProperty(top, "clientWidth", { configurable: true, value: 420 });
        act(() => jest.advanceTimersByTime(20));
        return { ...result, top, spacer: top.firstElementChild as HTMLDivElement };
    }

    it("matches scroll ranges and synchronizes in both directions without changing vertical scroll", () => {
        const { top, spacer } = mount();
        expect(spacer.style.width).toBe("1020px");
        content.scrollTop = 90;
        top.scrollLeft = 300;
        fireEvent.scroll(top);
        expect(content.scrollLeft).toBe(300);
        expect(content.scrollTop).toBe(90);
        content.scrollLeft = 170;
        fireEvent.scroll(content);
        expect(top.scrollLeft).toBe(170);
    });

    it("remeasures after hide/show or column resizing even without a ResizeObserver notification", () => {
        const { spacer } = mount();
        Object.defineProperty(content, "scrollWidth", { value: 650 });
        act(() => runInAction(() => mockLayout.set("200px 450px")));
        act(() => jest.advanceTimersByTime(20));
        expect(spacer.style.width).toBe("670px");
        Object.defineProperty(content, "scrollWidth", { value: 1000 });
        act(() => runInAction(() => mockLayout.set("200px 800px")));
        act(() => jest.advanceTimersByTime(20));
        expect(spacer.style.width).toBe("1020px");
    });

    it("remeasures the viewport and cleans up observers, listeners and queued frames", () => {
        const { top, spacer, unmount } = mount();
        Object.defineProperty(content, "clientWidth", { value: 600 });
        act(() => resize([], {} as ResizeObserver));
        act(() => jest.advanceTimersByTime(20));
        expect(spacer.style.width).toBe("820px");
        act(() => resize([], {} as ResizeObserver));
        unmount();
        expect(disconnect).toHaveBeenCalledTimes(1);
        expect(jest.getTimerCount()).toBe(0);
        content.scrollLeft = 111;
        fireEvent.scroll(content);
        expect(top.scrollLeft).toBe(0);
    });

    it("falls back to window resize when ResizeObserver is unavailable", () => {
        global.ResizeObserver = undefined as unknown as typeof ResizeObserver;
        const { spacer } = mount();
        Object.defineProperty(content, "scrollWidth", { value: 700 });
        fireEvent(window, new Event("resize"));
        act(() => jest.advanceTimersByTime(20));
        expect(spacer.style.width).toBe("720px");
    });

    it("does not poll indefinitely when the expected grid container is absent", () => {
        mockStore.gridContainerRef.current = null;
        mount();
        expect(jest.getTimerCount()).toBe(0);
    });

    it("collapses without horizontal overflow and reappears when columns grow", () => {
        Object.defineProperty(content, "scrollWidth", { value: 400 });
        const { top } = mount();
        expect(top).toHaveClass("widget-datagrid-top-scrollbar--collapsed");
        Object.defineProperty(content, "scrollWidth", { value: 900 });
        act(() => runInAction(() => mockLayout.set("450px 450px")));
        act(() => jest.advanceTimersByTime(20));
        expect(top).not.toHaveClass("widget-datagrid-top-scrollbar--collapsed");
    });

    it("preserves negative horizontal offsets used by RTL viewports", () => {
        content.dir = "rtl";
        const { top } = mount();
        content.scrollLeft = -150;
        fireEvent.scroll(content);
        expect(top.scrollLeft).toBe(-150);
        top.scrollLeft = -300;
        fireEvent.scroll(top);
        expect(content.scrollLeft).toBe(-300);
    });

    it("leaves other grid instances untouched", () => {
        const otherContent = document.createElement("div");
        otherContent.className = "widget-datagrid-content";
        document.body.prepend(otherContent);
        try {
            const { top } = mount();
            top.scrollLeft = 200;
            fireEvent.scroll(top);
            expect(content.scrollLeft).toBe(200);
            expect(otherContent.scrollLeft).toBe(0);
        } finally {
            otherContent.remove();
        }
    });
});
