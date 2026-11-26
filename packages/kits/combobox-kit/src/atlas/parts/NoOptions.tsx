import classNames from "classnames";
import { ReactElement } from "react";
import { ComboboxViewModel } from "../../core/ComboboxViewModel";
import { useComboboxClasses } from "../../hooks/useComboboxClasses";

export interface NoOptionsProps {
    vm: ComboboxViewModel;
}

/** The one row of an open menu without options. Without text there is nothing to announce, so it renders nothing. */
export function NoOptions({ vm }: NoOptionsProps): ReactElement | null {
    const classes = useComboboxClasses();
    const text = vm.t("noOptions");

    // Blank text would still be reachable as an empty option by screen readers.
    if (!text.trim()) {
        return null;
    }

    return (
        <li className={classNames(classes.menuItem, classes.noOptions)} role="option">
            {text}
        </li>
    );
}
