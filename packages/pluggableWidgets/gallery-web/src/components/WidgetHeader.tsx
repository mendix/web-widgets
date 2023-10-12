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
        <section className="widget-gallery-header widget-gallery-filter" aria-label={headerTitle || "Gallery header"}>
            {children}
        </section>
    );
}
