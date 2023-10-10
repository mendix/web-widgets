import { createElement, Fragment, PropsWithChildren, ReactElement } from "react";

interface WidgetHeaderProps extends PropsWithChildren {
    headerTitle?: string;
}

export function WidgetHeader(props: WidgetHeaderProps): ReactElement | null {
    const { children, headerTitle } = props;

    if (!children) {
        return <Fragment />;
    }

    return (
        <div className="widget-gallery-header widget-gallery-filter" role="section" aria-label={headerTitle}>
            {children}
        </div>
    );
}
