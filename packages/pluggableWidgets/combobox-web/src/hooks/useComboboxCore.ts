import { reaction } from "mobx";
import { useCallback, useRef, useSyncExternalStore } from "react";
import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { ComboboxContainerProps } from "../../typings/ComboboxProps";
import { ComboboxCore } from "../core/ComboboxCore";
import { ComboboxViewModel } from "../core/ComboboxViewModel";
import { createComboboxContainer } from "../core/createComboboxContainer";
import { CB_TOKENS as CB } from "../core/tokens";

export interface ComboboxCoreHandle {
    core: ComboboxCore;
    vm: ComboboxViewModel;
}

/**
 * One container per widget instance, its setup components started on mount, the latest props
 * pushed through the gate on every render, and the ViewModel snapshot the View renders from.
 *
 * Props are pushed during render, as the selector took them before the container existed. A
 * change made here is read by the same render through `getSnapshot`, so the subscription must not
 * report it to React (that would be an update scheduled while rendering). The `rendering` flag
 * mutes the reaction for exactly that window; every change made outside render, such as the
 * search term, still re-renders.
 */
export function useComboboxCore(props: ComboboxContainerProps): ComboboxCoreHandle {
    const renderingRef = useRef(false);
    renderingRef.current = true;

    const container = useConst(() => createComboboxContainer(props));
    useSetup(() => container.get(CB.setupService));
    container.setProps(props);
    const core = container.get(CB.core);

    const subscribe = useCallback(
        (onChange: () => void) =>
            reaction(
                () => core.viewModel,
                () => {
                    if (!renderingRef.current) {
                        onChange();
                    }
                }
            ),
        [core]
    );
    const read = useCallback(() => core.viewModel, [core]);
    const vm = useSyncExternalStore(subscribe, read, read);

    renderingRef.current = false;
    return { core, vm };
}
