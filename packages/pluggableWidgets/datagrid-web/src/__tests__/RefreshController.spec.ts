import { GateProvider } from "@mendix/widget-plugin-mobx-kit/GateProvider";
import { ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/main";
import { list } from "@mendix/widget-plugin-test-utils";
import { ListValue } from "mendix";
import { observable } from "mobx";
import { RefreshController } from "../controllers/RefreshController";

describe("RefreshController", () => {
    let gateProvider: GateProvider<{ datasource: ListValue }>;
    let refreshController: RefreshController;

    beforeEach(() => {
        jest.useFakeTimers();

        const host = {
            addController: jest.fn()
        } as unknown as ReactiveControllerHost;

        gateProvider = new GateProvider({ datasource: list(0) });

        refreshController = new RefreshController(host, { delay: 1000, gate: gateProvider.gate });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("should call reload method on datasource after setup", () => {
        const { datasource: ds } = gateProvider.gate.props;
        refreshController.setup();
        jest.advanceTimersByTime(1000);
        expect(ds.reload).toHaveBeenCalled();
    });

    it("should schedule reload for every new datasource", () => {
        const { datasource: ds1 } = gateProvider.gate.props;
        refreshController.setup();
        jest.advanceTimersByTime(1000);
        expect(ds1.reload).toHaveBeenCalled();
        const ds2 = list(0);
        gateProvider.setProps({ datasource: ds2 });
        jest.advanceTimersByTime(1000);
        expect(ds2.reload).toHaveBeenCalled();
    });

    describe("isRefreshing", () => {
        it("should be true after reload while ds is loading", () => {
            refreshController.setup();
            expect(refreshController.isRefreshing).toBe(false);
            jest.advanceTimersByTime(1000);
            expect(refreshController.isRefreshing).toBe(true);
            gateProvider.setProps({ datasource: list.loading() });
            expect(refreshController.isRefreshing).toBe(true);
            gateProvider.setProps({ datasource: list(1) });
            expect(refreshController.isRefreshing).toBe(false);
        });

        it("should ignore status if not reloaded", () => {
            refreshController.setup();
            gateProvider.setProps({ datasource: list.loading() });
            expect(refreshController.isRefreshing).toBe(false);
        });

        it("should be reactive", () => {
            const derived = observable({
                get isRefreshing() {
                    return refreshController.isRefreshing;
                }
            });
            refreshController.setup();
            expect(derived.isRefreshing).toBe(false);
            jest.advanceTimersByTime(1000);
            expect(derived.isRefreshing).toBe(true);
            gateProvider.setProps({ datasource: list(1) });
            expect(derived.isRefreshing).toBe(false);
        });
    });
});
