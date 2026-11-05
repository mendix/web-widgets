import { DerivedPropsGate, SetupComponent, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";
import { ComboboxGateProps } from "./ComboboxGate";

/**
 * Runs the "On change filter input" action, debounced with the configured interval. The action is
 * read from the gate when the timer fires, so a Mendix refresh in between is not a problem, and
 * a pending call is dropped on unmount.
 */
export class FilterInputEventService implements SetupComponent {
    /** Schedules the action with the latest filter text. */
    readonly notify: (filterInput: string) => void;
    private readonly abort: () => void;

    constructor(
        host: SetupComponentHost,
        private readonly gate: DerivedPropsGate<Pick<ComboboxGateProps, "onChangeFilterInputEvent">>,
        config: { filterInputDebounceInterval: number }
    ) {
        [this.notify, this.abort] = debounce(
            (filterInput: string) => this.execute(filterInput),
            config.filterInputDebounceInterval
        );
        host.add(this);
    }

    setup(): () => void {
        return this.abort;
    }

    private execute(filterInput: string): void {
        const action = this.gate.props.onChangeFilterInputEvent;
        if (action?.canExecute && !action.isExecuting) {
            action.execute({ filterInput: filterInput || undefined });
        }
    }
}
