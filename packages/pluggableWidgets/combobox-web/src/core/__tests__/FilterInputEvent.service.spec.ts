import { GateProvider, SetupHost } from "@mendix/widget-plugin-mobx-kit/main";
import { actionValue } from "@mendix/widget-plugin-test-utils";
import { ComboboxContainerProps } from "../../../typings/ComboboxProps";
import { FilterInputEventService } from "../FilterInputEvent.service";

type FilterAction = NonNullable<ComboboxContainerProps["onChangeFilterInputEvent"]>;

class Host extends SetupHost {}

function createService(
    action: FilterAction | undefined,
    interval = 200
): [FilterInputEventService, GateProvider<{ onChangeFilterInputEvent?: FilterAction }>, Host] {
    const host = new Host();
    const provider = new GateProvider({ onChangeFilterInputEvent: action });
    return [
        new FilterInputEventService(host, provider.gate, { filterInputDebounceInterval: interval }),
        provider,
        host
    ];
}

describe("FilterInputEventService", () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it("debounces the action and sends the last term", () => {
        const action = actionValue<FilterAction>();
        const [service] = createService(action);

        service.notify("a");
        service.notify("ab");
        expect(action.execute).not.toHaveBeenCalled();

        jest.advanceTimersByTime(200);

        expect(action.execute).toHaveBeenCalledTimes(1);
        expect(action.execute).toHaveBeenCalledWith({ filterInput: "ab" });
    });

    it("respects the configured interval", () => {
        const action = actionValue<FilterAction>();
        const [service] = createService(action, 500);

        service.notify("a");
        jest.advanceTimersByTime(200);
        expect(action.execute).not.toHaveBeenCalled();

        jest.advanceTimersByTime(300);
        expect(action.execute).toHaveBeenCalledTimes(1);
    });

    it("sends undefined for an empty term", () => {
        const action = actionValue<FilterAction>();
        const [service] = createService(action);

        service.notify("");
        jest.advanceTimersByTime(200);

        expect(action.execute).toHaveBeenCalledWith({ filterInput: undefined });
    });

    it("skips the action when it cannot execute or is already executing", () => {
        const cannot = actionValue<FilterAction>(false);
        createService(cannot)[0].notify("a");
        jest.advanceTimersByTime(200);
        expect(cannot.execute).not.toHaveBeenCalled();

        const executing = actionValue<FilterAction>(true, true);
        createService(executing)[0].notify("a");
        jest.advanceTimersByTime(200);
        expect(executing.execute).not.toHaveBeenCalled();
    });

    it("reads the action from the gate when the timer fires", () => {
        const stale = actionValue<FilterAction>();
        const fresh = actionValue<FilterAction>();
        const [service, provider] = createService(stale);

        service.notify("a");
        provider.setProps({ onChangeFilterInputEvent: fresh });
        jest.advanceTimersByTime(200);

        expect(stale.execute).not.toHaveBeenCalled();
        expect(fresh.execute).toHaveBeenCalledWith({ filterInput: "a" });
    });

    it("drops a pending call when the host is disposed", () => {
        const action = actionValue<FilterAction>();
        const [service, , host] = createService(action);
        const dispose = host.setup();

        service.notify("a");
        dispose();
        jest.advanceTimersByTime(200);

        expect(action.execute).not.toHaveBeenCalled();
    });
});
