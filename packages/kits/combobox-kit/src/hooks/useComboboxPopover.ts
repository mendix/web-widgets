import { CSSProperties } from "react";
import { useFloatingMenu } from "./useFloatingMenu";
import { ComboboxViewModel } from "../core/ComboboxViewModel";

export interface ComboboxPopover {
    setReference: (node: HTMLElement | null) => void;
    setFloating: (node: HTMLElement | null) => void;
    styles: CSSProperties;
    isPositioned: boolean;
}

/**
 * Positions the menu under the input with floating-ui: fixed strategy, bottom-start, flip,
 * height capped, width matched to the input. `alwaysOpen` is the editor preview's inline menu
 * and disables positioning entirely. See docs/design/headless-combobox.md, section 5.
 */
export function useComboboxPopover(vm: ComboboxViewModel, options: { alwaysOpen?: boolean } = {}): ComboboxPopover {
    const { refs, floatingStyles, isPositioned } = useFloatingMenu(options.alwaysOpen ? false : vm.isOpen);
    return { setReference: refs.setReference, setFloating: refs.setFloating, styles: floatingStyles, isPositioned };
}
