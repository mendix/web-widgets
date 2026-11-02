import { ReactElement } from "react";
import { DownArrow } from "../../assets/icons";
import { ComboboxViewModel } from "../../core/ComboboxViewModel";
import { useComboboxClasses } from "../../hooks/useComboboxClasses";
import { SpinnerLoader } from "../SpinnerLoader";

export interface ToggleProps {
    vm: ComboboxViewModel;
    isOpen: boolean;
}

/** The chevron at the end of the input container, a spinner while a lazy datasource loads. */
export function Toggle({ vm, isOpen }: ToggleProps): ReactElement {
    const classes = useComboboxClasses();
    const loading = vm.loading.lazy && vm.loading.isLoading;

    return (
        <div className={classes.toggle} data-open={isOpen || undefined}>
            {loading ? <SpinnerLoader size="small" /> : <DownArrow isOpen={isOpen} />}
        </div>
    );
}
