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
        <div className="widget-datagrid-header header-filters" aria-label={headerTitle || undefined}>
            {children}
        </div>
    );
}
