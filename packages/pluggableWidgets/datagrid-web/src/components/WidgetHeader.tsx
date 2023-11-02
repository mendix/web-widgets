import { createElement, ReactElement } from "react";

type WidgetHeaderProps = {
    headerTitle?: string;
} & JSX.IntrinsicElements["div"];

export function WidgetHeader(props: WidgetHeaderProps): ReactElement | null {
    const { children, headerTitle, ...rest } = props;

    if (!children) {
        return null;
    }

    return (
        <div {...rest} className="widget-datagrid-header header-filters" aria-label={headerTitle || undefined}>
            {children}
        </div>
    );
}
