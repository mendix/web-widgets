import { list } from "@mendix/widget-plugin-test-utils";
import { LazyLoadProvider } from "../LazyLoadProvider";

function providerWithLimit(limit: number): LazyLoadProvider {
    const provider = new LazyLoadProvider();
    const ds = list(2);
    (ds as { limit: number }).limit = limit;
    provider.updateProps(ds);
    return provider;
}

describe("LazyLoadProvider.getLimit", () => {
    it("returns 0 while the datasource is unavailable", () => {
        expect(providerWithLimit(100).getLimit(100, false, "unavailable", true)).toBe(0);
        expect(providerWithLimit(100).getLimit(100, false, "unavailable", false)).toBe(0);
    });

    it("returns 0 while loading without lazy loading", () => {
        expect(providerWithLimit(100).getLimit(100, false, "loading", false)).toBe(0);
    });

    it("keeps the remembered limit while loading with lazy loading", () => {
        expect(providerWithLimit(50).getLimit(100, false, "loading", true)).toBe(50);
    });

    it("treats a remembered limit of 0 or Infinity as 0 while loading with lazy loading", () => {
        expect(providerWithLimit(0).getLimit(100, false, "loading", true)).toBe(0);
        expect(providerWithLimit(Infinity).getLimit(100, false, "loading", true)).toBe(0);
    });

    it("returns 0 for a read-only control, so no options are loaded", () => {
        expect(providerWithLimit(100).getLimit(100, true, "available", true)).toBe(0);
        expect(providerWithLimit(100).getLimit(100, true, "available", false)).toBe(0);
    });

    it("removes the limit (undefined) when available without lazy loading", () => {
        expect(providerWithLimit(100).getLimit(100, false, "available", false)).toBeUndefined();
    });

    it("never shrinks the limit with lazy loading", () => {
        const provider = providerWithLimit(100);

        expect(provider.getLimit(50, false, "available", true)).toBe(100);
    });

    it("grows and remembers the limit with lazy loading", () => {
        const provider = providerWithLimit(100);

        expect(provider.getLimit(200, false, "available", true)).toBe(200);
        expect(provider.getLimit(150, false, "available", true)).toBe(200);
    });
});

describe("LazyLoadProvider.setLimit", () => {
    it("writes the limit only when it differs from the datasource limit", () => {
        const provider = new LazyLoadProvider();
        const ds = list(2);
        (ds as { limit: number }).limit = 100;
        provider.updateProps(ds);

        provider.setLimit(100);
        expect(ds.setLimit).not.toHaveBeenCalled();

        provider.setLimit(200);
        expect(ds.setLimit).toHaveBeenCalledWith(200);

        provider.setLimit(undefined);
        expect(ds.setLimit).toHaveBeenCalledWith(undefined);
    });
});
