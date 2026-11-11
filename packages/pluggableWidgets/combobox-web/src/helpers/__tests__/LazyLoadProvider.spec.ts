import { ValueStatus } from "mendix";
import { ListValueBuilder } from "@mendix/widget-plugin-test-utils";
import { LazyLoadProvider } from "../LazyLoadProvider";

function providerWithLimit(limit: number): LazyLoadProvider {
    const provider = new LazyLoadProvider();
    provider.updateProps(new ListValueBuilder().withSize(2).withLimit(limit).build());
    return provider;
}

describe("LazyLoadProvider.getLimit", () => {
    it("returns 0 while the datasource is unavailable", () => {
        expect(providerWithLimit(100).getLimit(100, false, ValueStatus.Unavailable, true)).toBe(0);
        expect(providerWithLimit(100).getLimit(100, false, ValueStatus.Unavailable, false)).toBe(0);
    });

    it("returns 0 while loading without lazy loading", () => {
        expect(providerWithLimit(100).getLimit(100, false, ValueStatus.Loading, false)).toBe(0);
    });

    it("keeps the remembered limit while loading with lazy loading", () => {
        expect(providerWithLimit(50).getLimit(100, false, ValueStatus.Loading, true)).toBe(50);
    });

    it("treats a remembered limit of 0 or Infinity as 0 while loading with lazy loading", () => {
        expect(providerWithLimit(0).getLimit(100, false, ValueStatus.Loading, true)).toBe(0);
        expect(providerWithLimit(Infinity).getLimit(100, false, ValueStatus.Loading, true)).toBe(0);
    });

    it("returns 0 for a read-only control, so no options are loaded", () => {
        expect(providerWithLimit(100).getLimit(100, true, ValueStatus.Available, true)).toBe(0);
        expect(providerWithLimit(100).getLimit(100, true, ValueStatus.Available, false)).toBe(0);
    });

    it("removes the limit (undefined) when available without lazy loading", () => {
        expect(providerWithLimit(100).getLimit(100, false, ValueStatus.Available, false)).toBeUndefined();
    });

    it("never shrinks the limit with lazy loading", () => {
        const provider = providerWithLimit(100);

        expect(provider.getLimit(50, false, ValueStatus.Available, true)).toBe(100);
    });

    it("grows and remembers the limit with lazy loading", () => {
        const provider = providerWithLimit(100);

        expect(provider.getLimit(200, false, ValueStatus.Available, true)).toBe(200);
        expect(provider.getLimit(150, false, ValueStatus.Available, true)).toBe(200);
    });
});

describe("LazyLoadProvider.setLimit", () => {
    it("writes the limit only when it differs from the datasource limit", () => {
        const provider = new LazyLoadProvider();
        const ds = new ListValueBuilder().withSize(2).withLimit(100).build();
        provider.updateProps(ds);

        provider.setLimit(100);
        expect(ds.setLimit).not.toHaveBeenCalled();

        provider.setLimit(200);
        expect(ds.setLimit).toHaveBeenCalledWith(200);

        provider.setLimit(undefined);
        expect(ds.setLimit).toHaveBeenCalledWith(undefined);
    });
});
