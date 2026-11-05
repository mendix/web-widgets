import { createComboboxContainer } from "../../core/createComboboxContainer";
import { CB_TOKENS as CB } from "../../core/tokens";
import { ComboboxContainerProps } from "../../typings/ComboboxProps";
import { Selector } from "../types";

export interface SelectorHarness<S extends Selector> {
    selector: S;
    /** The next render: pushes a new props object through the gate. */
    setProps(props: ComboboxContainerProps): void;
    dispose(): void;
}

/**
 * A selector the way the widget creates it: resolved from the container with its setup components
 * running, so the side effects on the Mendix values (limit, filter, selection) happen as in the app.
 */
export function createSelector<S extends Selector>(props: ComboboxContainerProps): SelectorHarness<S> {
    const container = createComboboxContainer(props);
    const dispose = container.get(CB.setupService).setup();
    return { selector: container.get(CB.selector) as S, setProps: container.setProps, dispose };
}
