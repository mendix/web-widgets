import classNames from "classnames";
import { ReactElement } from "react";
import { ComboboxViewModel } from "../../core/ComboboxViewModel";
import { useComboboxClasses } from "../../hooks/useComboboxClasses";

export interface NoOptionsProps {
    vm: ComboboxViewModel;
}

/** The one row of an open menu without options. */
export function NoOptions({ vm }: NoOptionsProps): ReactElement {
    const classes = useComboboxClasses();

    return (
        <li className={classNames(classes.menuItem, classes.noOptions)} role="option">
            {vm.t("noOptions")}
        </li>
    );
}
