import { GateProvider } from "@mendix/widget-plugin-mobx-kit/GateProvider";
import { SetupHost } from "@mendix/widget-plugin-mobx-kit/SetupHost";
import { list, obj } from "@mendix/widget-plugin-test-utils";
import { ListValue } from "mendix";
import { DatasourceService } from "../Datasource.service";

class TestControllerHost extends SetupHost {}

describe("DatasourceService loading states", () => {
    let controller: DatasourceService;
    let datasource: ListValue;
    let provider: GateProvider<{ datasource: ListValue; refreshIndicator: boolean; refreshInterval: number }>;

    beforeEach(() => {
        const host = new TestControllerHost();
        provider = new GateProvider({ datasource: list.loading(), refreshIndicator: false, refreshInterval: 0 });
        host.setup();
        controller = new DatasourceService(host, provider.gate);
        controller.setup();
    });

    describe("when datasource is loading", () => {
        beforeEach(() => {
            datasource = list.loading();
            provider.setProps({ datasource, refreshIndicator: false, refreshInterval: 0 });
        });

        it("isFirstLoad returns true when loading and items undefined", () => {
            expect(controller.isFirstLoad).toBe(true);
        });

        it("backgroundRefresh does not trigger reload if already loading", () => {
            const reloadSpy = jest.spyOn(provider.gate.props.datasource, "reload");
            controller.backgroundRefresh();
            expect(reloadSpy).not.toHaveBeenCalled();
        });

        it("isRefreshing is false when loading and items undefined", () => {
            expect(controller.isRefreshing).toBe(false);
        });

        it("isRefreshing is true after backgroundRefresh when items are present", () => {
            // Set datasource to available with items
            provider.setProps({ datasource: list(1), refreshIndicator: false, refreshInterval: 0 });
            // Simulate refresh
            controller.backgroundRefresh();
            // Replace datasource with a mock in loading state and items present
            const loadingWithItems = { ...list.loading(), items: [obj()] };
            provider.setProps({ datasource: loadingWithItems, refreshIndicator: false, refreshInterval: 0 });
            expect(controller.isRefreshing).toBe(true);
        });

        it("isFetchingNextBatch is true after setLimit call", () => {
            controller.setLimit(20);
            expect(controller.isFetchingNextBatch).toBe(true);
        });

        it("isSilentRefresh is true after backgroundRefresh", () => {
            provider.setProps({ datasource: list(1), refreshIndicator: false, refreshInterval: 0 });
            controller.backgroundRefresh();
            expect(controller.isSilentRefresh).toBe(true);
        });
    });

    describe("when datasource is not loading", () => {
        beforeEach(() => {
            datasource = list(0);
            provider.setProps({ datasource, refreshIndicator: false, refreshInterval: 0 });
        });

        it("All loading states return false", () => {
            expect(controller.isFirstLoad).toBe(false);
            expect(controller.isRefreshing).toBe(false);
            expect(controller.isFetchingNextBatch).toBe(false);
            expect(controller.isSilentRefresh).toBe(false);
        });

        it("backgroundRefresh triggers reload when not loading", () => {
            const reloadSpy = jest.spyOn(datasource, "reload");
            controller.backgroundRefresh();
            expect(reloadSpy).toHaveBeenCalled();
        });

        it("setLimit triggers setLimit on datasource", () => {
            const setLimitSpy = jest.spyOn(datasource, "setLimit");
            controller.setLimit(20);
            expect(setLimitSpy).toHaveBeenCalledWith(20);
        });

        it("setOffset triggers setOffset and resets flags", () => {
            const setOffsetSpy = jest.spyOn(datasource, "setOffset");
            controller.setOffset(5);
            expect(setOffsetSpy).toHaveBeenCalledWith(5);
        });

        it("setSortOrder triggers setSortOrder and resets flags", () => {
            const setSortOrderSpy = jest.spyOn(datasource, "setSortOrder");
            // Use Mendix Option_2 structure (runtime shape)
            const sortOption = { some: [{ attribute: "name", direction: "asc" }] };
            // @ts-expect-error: Mendix Option_2 type not available in workspace
            controller.setSortOrder(sortOption);
            expect(setSortOrderSpy).toHaveBeenCalledWith(sortOption);
        });

        it("setFilter triggers setFilter and resets flags", () => {
            const setFilterSpy = jest.spyOn(datasource, "setFilter");
            // Use Mendix Option_2 structure (runtime shape)
            const filterOption = { some: { attribute: "name", operator: "equals", value: "test" } };
            // @ts-expect-error: Mendix Option_2 type not available in workspace
            controller.setFilter(filterOption);
            expect(setFilterSpy).toHaveBeenCalledWith(filterOption);
        });

        it("setBaseLimit updates baseLimit property", () => {
            controller.setBaseLimit(50);
            // @ts-expect-error: private property
            expect(controller.baseLimit).toBe(50);
        });

        it("requestTotalCount triggers datasource.requestTotalCount", () => {
            const spy = jest.spyOn(datasource, "requestTotalCount");
            controller.requestTotalCount(true);
            expect(spy).toHaveBeenCalledWith(true);
        });
    });
});
