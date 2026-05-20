import { renderHook, act } from "@testing-library/react";
import { createRef, UIEvent } from "react";

jest.mock("@mendix/widget-plugin-hooks/useOnScreen", () => ({
    useOnScreen: () => true
}));

const mockBumpPage = jest.fn();
const mockLockGridContainerHeight = jest.fn();
const mockGridContainerRef = createRef<HTMLDivElement>();

jest.mock("../injection-hooks", () => ({
    useGridSizeStore: () => ({
        hasVirtualScrolling: true,
        gridContainerRef: mockGridContainerRef,
        bumpPage: mockBumpPage,
        lockGridContainerHeight: mockLockGridContainerHeight
    })
}));

import { useInfiniteControl } from "../useInfiniteControl";
import { VIRTUAL_SCROLLING_OFFSET } from "../../stores/GridSize.store";

function makeScrollEvent(overrides: {
    scrollTop: number;
    scrollHeight: number;
    clientHeight: number;
    scrollLeft?: number;
}): UIEvent<HTMLDivElement> {
    const { scrollTop, scrollHeight, clientHeight, scrollLeft = 0 } = overrides;
    return {
        target: { scrollTop, scrollHeight, clientHeight, scrollLeft }
    } as unknown as UIEvent<HTMLDivElement>;
}

describe("useInfiniteControl — trackTableScrolling", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        mockBumpPage.mockClear();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("does not call bumpPage when scrollTop is 0, even if scroll position satisfies bottom condition", () => {
        const { result } = renderHook(() => useInfiniteControl());
        const [trackTableScrolling] = result.current;

        // scrollTop === 0 → guard blocks bumpPage regardless of height math
        const e = makeScrollEvent({
            scrollTop: 0,
            scrollHeight: 500,
            clientHeight: 500
        });

        act(() => {
            trackTableScrolling!(e);
        });

        expect(mockBumpPage).not.toHaveBeenCalled();
    });

    it("calls bumpPage when scrollTop > 0 and scroll position reaches the bottom", () => {
        const { result } = renderHook(() => useInfiniteControl());
        const [trackTableScrolling] = result.current;

        // scrollTop > 0 and Math.floor(scrollHeight - OFFSET - scrollTop) <= clientHeight + 2
        const scrollHeight = 500;
        const clientHeight = 400;
        const scrollTop = scrollHeight - VIRTUAL_SCROLLING_OFFSET - clientHeight; // exactly at bottom

        const e = makeScrollEvent({ scrollTop, scrollHeight, clientHeight });

        act(() => {
            trackTableScrolling!(e);
        });

        expect(mockBumpPage).toHaveBeenCalledTimes(1);
    });

    it("does not call bumpPage when scrolled but not yet at the bottom", () => {
        const { result } = renderHook(() => useInfiniteControl());
        const [trackTableScrolling] = result.current;

        const e = makeScrollEvent({
            scrollTop: 10,
            scrollHeight: 500,
            clientHeight: 100
        });

        act(() => {
            trackTableScrolling!(e);
        });

        expect(mockBumpPage).not.toHaveBeenCalled();
    });
});
