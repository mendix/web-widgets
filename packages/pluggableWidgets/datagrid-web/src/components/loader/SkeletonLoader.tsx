import { createElement, ReactElement } from "react";

type SkeletonLoaderProps = {
    withCheckbox?: boolean;
};

export function SkeletonLoader({ withCheckbox = false }: SkeletonLoaderProps): ReactElement {
    return (
        <div className="widget-datagrid-skeleton" aria-busy aria-live="polite">
            {withCheckbox && <span className="widget-datagrid-skeleton-loader widget-datagrid-skeleton-loader-small" />}
            <span className="widget-datagrid-skeleton-loader" />
        </div>
    );
}
