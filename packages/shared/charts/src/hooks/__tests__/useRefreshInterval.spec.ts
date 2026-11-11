import { renderHook } from "@testing-library/react";
import { ListValue } from "mendix";
import { ListValueBuilder } from "@mendix/widget-plugin-test-utils";
import { seriesDataSources, useRefreshInterval } from "../useRefreshInterval";

describe("seriesDataSources", () => {
    it("picks the active data source of each series", () => {
        const staticDs = new ListValueBuilder().build();
        const dynamicDs = new ListValueBuilder().build();

        expect(
            seriesDataSources([
                { dataSet: "static", staticDataSource: staticDs, dynamicDataSource: dynamicDs },
                { dataSet: "dynamic", staticDataSource: staticDs, dynamicDataSource: dynamicDs },
                { dataSet: "dynamic" }
            ])
        ).toEqual([staticDs, dynamicDs, undefined]);
    });
});

type HookProps = { datasources: Array<ListValue | undefined>; interval: number };

function setup(initialProps: HookProps): ReturnType<typeof renderHook<void, HookProps>> {
    return renderHook(({ datasources, interval }: HookProps) => useRefreshInterval(datasources, interval), {
        initialProps
    });
}

describe("useRefreshInterval", () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it("does not reload when interval is 0", () => {
        const ds = new ListValueBuilder().build();
        setup({ datasources: [ds], interval: 0 });

        jest.advanceTimersByTime(60_000);

        expect(ds.reload).not.toHaveBeenCalled();
    });

    it("reloads data source once after the interval", () => {
        const ds = new ListValueBuilder().build();
        setup({ datasources: [ds], interval: 5 });

        jest.advanceTimersByTime(4999);
        expect(ds.reload).not.toHaveBeenCalled();
        jest.advanceTimersByTime(1);
        expect(ds.reload).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(60_000);
        expect(ds.reload).toHaveBeenCalledTimes(1);
    });

    it("reloads all data sources and ignores undefined ones", () => {
        const a = new ListValueBuilder().build();
        const b = new ListValueBuilder().build();
        setup({ datasources: [a, undefined, b], interval: 10 });

        jest.advanceTimersByTime(10_000);

        expect(a.reload).toHaveBeenCalledTimes(1);
        expect(b.reload).toHaveBeenCalledTimes(1);
    });

    it("restarts the timer when a data source updates", () => {
        const ds = new ListValueBuilder().build();
        const { rerender } = setup({ datasources: [ds], interval: 10 });

        jest.advanceTimersByTime(6000);
        const updated = new ListValueBuilder().withSize(3).build();
        rerender({ datasources: [updated], interval: 10 });

        jest.advanceTimersByTime(4000);
        expect(ds.reload).not.toHaveBeenCalled();
        expect(updated.reload).not.toHaveBeenCalled();

        jest.advanceTimersByTime(6000);
        expect(updated.reload).toHaveBeenCalledTimes(1);
        expect(ds.reload).not.toHaveBeenCalled();
    });

    it("does not restart the timer on re-render with the same data sources", () => {
        const ds = new ListValueBuilder().build();
        const { rerender } = setup({ datasources: [ds], interval: 10 });

        jest.advanceTimersByTime(6000);
        rerender({ datasources: [ds], interval: 10 });
        jest.advanceTimersByTime(4000);

        expect(ds.reload).toHaveBeenCalledTimes(1);
    });

    it("skips data sources that are loading", () => {
        const loading = new ListValueBuilder().isLoading().build();
        const ready = new ListValueBuilder().build();
        setup({ datasources: [loading, ready], interval: 5 });

        jest.advanceTimersByTime(5000);

        expect(loading.reload).not.toHaveBeenCalled();
        expect(ready.reload).toHaveBeenCalledTimes(1);
    });

    it("reschedules when the interval changes", () => {
        const ds = new ListValueBuilder().build();
        const { rerender } = setup({ datasources: [ds], interval: 10 });

        rerender({ datasources: [ds], interval: 0 });
        jest.advanceTimersByTime(60_000);

        expect(ds.reload).not.toHaveBeenCalled();
    });

    it("keeps refreshing after a StrictMode remount", () => {
        const ds = new ListValueBuilder().build();
        renderHook(() => useRefreshInterval([ds], 5), { reactStrictMode: true });

        jest.advanceTimersByTime(5000);

        expect(ds.reload).toHaveBeenCalledTimes(1);
    });

    it("cancels the pending timer on unmount", () => {
        const ds = new ListValueBuilder().build();
        const { unmount } = setup({ datasources: [ds], interval: 5 });

        unmount();
        jest.advanceTimersByTime(60_000);

        expect(ds.reload).not.toHaveBeenCalled();
    });
});
