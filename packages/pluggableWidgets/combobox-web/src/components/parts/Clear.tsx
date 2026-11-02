import { ReactElement } from "react";
import { ClearButton } from "../../assets/icons";
import { ComboboxBehavior } from "../../hooks/useComboboxBehavior";
import { useComboboxClasses } from "../../hooks/useComboboxClasses";

export interface ClearProps {
    /** From the Behavior: label and click handler that clear the whole selection. */
    clearProps: ReturnType<ComboboxBehavior["getClearProps"]>;
}

/** The button that clears the selection. The View renders it while there is something to clear. */
export function Clear({ clearProps }: ClearProps): ReactElement {
    const classes = useComboboxClasses();

    return (
        <button className={classes.clear} {...clearProps}>
            <ClearButton />
        </button>
    );
}
