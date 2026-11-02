import { ComboboxViewModel } from "../core/ComboboxViewModel";

/** What a selection View receives: the ViewModel snapshot it renders from, and nothing else. */
export interface SelectionProps {
    vm: ComboboxViewModel;
    /** Editor preview only: render the menu inline and always open. */
    keepMenuOpen?: boolean;
    /** Extra class on the root element. */
    className?: string;
}
