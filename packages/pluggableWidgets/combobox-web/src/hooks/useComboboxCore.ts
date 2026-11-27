import { reaction } from "mobx";
import { useCallback, useLayoutEffect, useSyncExternalStore } from "react";
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
 * Props are pushed during render, so the same render reads them through `getSnapshot`. A change
 * made by that push must not be reported to React (it would be an update scheduled while
 * rendering), so the subscription ignores it. The reactions that write to Mendix values wait for
 * the commit and run in a layout effect.
 */
export function useComboboxCore(props: ComboboxContainerProps): ComboboxCoreHandle {
    const container = useConst(() => createComboboxContainer(props));
    const host = useSetup(() => container.get(CB.setupService));
    host.pushProps(() => container.setProps(props));
    const core = container.get(CB.core);

    const subscribe = useCallback(
        (onChange: () => void) =>
            reaction(
                () => core.viewModel,
                () => {
                    if (!host.isPushingProps) {
                        onChange();
                    }
                }
            ),
        [core, host]
    );
    const read = useCallback(() => core.viewModel, [core]);
    const vm = useSyncExternalStore(subscribe, read, read);
    useLayoutEffect(() => host.flush());

    return { core, vm };
}
