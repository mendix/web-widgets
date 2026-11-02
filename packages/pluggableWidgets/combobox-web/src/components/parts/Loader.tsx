import { Fragment, ReactElement } from "react";
import { ComboboxViewModel } from "../../core/ComboboxViewModel";
import { DEFAULT_LIMIT_SIZE } from "../../helpers/utils";
import { SkeletonLoader } from "../SkeletonLoader";
import { SpinnerLoader } from "../SpinnerLoader";

export interface LoaderProps {
    vm: ComboboxViewModel;
    isOpen: boolean;
}

/** The loading rows at the end of the list while a lazy datasource loads: skeletons or a spinner, per the hint. */
export function Loader({ vm, isOpen }: LoaderProps): ReactElement | null {
    if (!isOpen || !vm.loading.lazy || !vm.loading.isLoading) {
        return null;
    }
    const withCheckbox = vm.mode === "multi" && vm.hints.selectionMethod === "checkbox";

    return vm.hints.loadingType === "skeleton" ? (
        <Fragment>
            {Array.from({ length: DEFAULT_LIMIT_SIZE }).map((_, i) => (
                <SkeletonLoader withCheckbox={withCheckbox} key={i} />
            ))}
        </Fragment>
    ) : (
        <SpinnerLoader withMargins={vm.options.length === 0} />
    );
}
