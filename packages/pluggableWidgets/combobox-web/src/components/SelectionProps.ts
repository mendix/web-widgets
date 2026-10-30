import { ComboboxCore } from "../core/ComboboxCore";
import { ComboboxViewModel } from "../core/ComboboxViewModel";
import { Selector } from "../helpers/types";

/**
 * What a selection View receives in migration step 2: the ViewModel snapshot it renders from, and
 * the Core for the behaviour hooks that still read the selector directly (downshift and lazy
 * loading). Step 3 replaces those hooks and drops `core`.
 */
export interface SelectionProps<S extends Selector> {
    core: ComboboxCore<S>;
    vm: ComboboxViewModel;
    /** Editor preview only: render the menu inline and always open. */
    keepMenuOpen?: boolean;
}
