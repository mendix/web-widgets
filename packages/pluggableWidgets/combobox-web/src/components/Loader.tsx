import { createElement, Fragment, ReactElement } from "react";
import { LoadingTypeEnum } from "typings/ComboboxProps";
import { DEFAULT_LIMIT_SIZE } from "../helpers/utils";
import { SkeletonLoader } from "./SkeletonLoader";
import { SpinnerLoader } from "./SpinnerLoader";

type LoaderProps = {
    isEmpty: boolean;
    isLoading: boolean;
    isOpen: boolean;
    lazyLoading: boolean;
    loadingType?: LoadingTypeEnum;
    withCheckbox: boolean;
};

export function Loader(props: LoaderProps): ReactElement | null {
    const { isEmpty, isLoading, isOpen, lazyLoading, loadingType, withCheckbox } = props;

    if (!isOpen || !lazyLoading || !isLoading) {
        return null;
    }

    return loadingType === "skeleton" ? (
        <Fragment>
            {Array.from({ length: DEFAULT_LIMIT_SIZE }).map((_, i) => (
                <SkeletonLoader withCheckbox={withCheckbox} key={i} />
            ))}
        </Fragment>
    ) : (
        <SpinnerLoader withMargins={isEmpty} />
    );
}
