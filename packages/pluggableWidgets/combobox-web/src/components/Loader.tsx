import { createElement, ReactElement } from "react";
import { LoadingTypeEnum } from "typings/ComboboxProps";
import { SpinnerLoader } from "./SpinnerLoader";
import { SkeletonLoader } from "./SkeletonLoader";

type LoaderProps = {
    isLoading: boolean;
    isOpen: boolean;
    lazyLoading: boolean;
    loadingType?: LoadingTypeEnum;
    withCheckbox: boolean;
};

export function Loader(props: LoaderProps): ReactElement | null {
    const { isLoading, isOpen, lazyLoading, loadingType, withCheckbox } = props;
    const Loader = loadingType === "skeleton" ? SkeletonLoader : SpinnerLoader;

    if (!isOpen || !lazyLoading || !isLoading) {
        return null;
    }

    return <Loader withCheckbox={withCheckbox} />;
}
