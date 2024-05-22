import { createElement, ReactElement } from "react";

type SkeletonLoaderProps = {
    withCheckbox?: boolean;
};

export function SkeletonLoader({ withCheckbox = false }: SkeletonLoaderProps): ReactElement {
    return (
        <div className="widget-combobox-skeleton">
            {withCheckbox && <span className="widget-combobox-skeleton-loader widget-combobox-skeleton-loader-small" />}
            <span className="widget-combobox-skeleton-loader" />
        </div>
    );
}
