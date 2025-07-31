import { BaseControllerHost } from "@mendix/widget-plugin-mobx-kit/BaseControllerHost";
import { GateProvider } from "@mendix/widget-plugin-mobx-kit/GateProvider";
// import { ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/main";
import { list } from "@mendix/widget-plugin-test-utils";
import { ListValue } from "mendix";
import { DatasourceController } from "../query/DatasourceController";

class TestControllerHost extends BaseControllerHost {}

describe("DatasourceController loading states", () => {
    let controller: DatasourceController;
    let datasource: ListValue;
    let provider: GateProvider<{ datasource: ListValue }>;

    beforeEach(() => {
        const host = new TestControllerHost();
        provider = new GateProvider({ datasource: list.loading() });
        host.setup();
        controller = new DatasourceController(host, { gate: provider.gate });
        controller.setup();
    });

    describe("when datasource is loading", () => {
        beforeEach(() => {
            datasource = list.loading();
            provider.setProps({ datasource });
        });

        it("isFirstLoad returns true by default", () => {
            expect(controller.isFirstLoad).toBe(true);
        });

        it("refresh has no effect if ds is loading", () => {
            expect(provider.gate.props.datasource.status).toBe("loading");
            controller.refresh();
            expect(controller.isRefreshing).toBe(false);
        });

        it("isRefreshing is true after refresh call", () => {
            provider.setProps({ datasource: list(0) });
            expect(provider.gate.props.datasource.status).toBe("available");
            controller.refresh();
            expect(controller.isRefreshing).toBe(true);
            provider.setProps({ datasource: list.loading() });
            expect(provider.gate.props.datasource.status).toBe("loading");
            expect(controller.isRefreshing).toBe(true);
            expect(controller.isFirstLoad).toBe(false);
        });

        it("isFetchingNextBatch returns true after setLimit call", () => {
            controller.setLimit(20);
            expect(controller.isFetchingNextBatch).toBe(true);
            expect(controller.isFirstLoad).toBe(true);
        });
    });

    describe("when datasource is not loading", () => {
        beforeEach(() => {
            datasource = list(0);
            provider.setProps({ datasource });
        });

        it("All loading states return false", () => {
            expect(controller.isFirstLoad).toBe(false);
            expect(controller.isRefreshing).toBe(false);
            expect(controller.isFetchingNextBatch).toBe(false);
        });

        it("triggers refresh when called", () => {
            controller.refresh();
            expect(datasource.reload).toHaveBeenCalled();
        });

        it("triggers setLimit when called", () => {
            controller.setLimit(20);
            expect(datasource.setLimit).toHaveBeenCalledWith(20);
        });
    });
});
