import { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";

type WidgetTopBarProps = {
    pagination: ReactNode;
    selectionCount: ReactNode;
} & ComponentPropsWithoutRef<"div">;

export function WidgetTopBar(props: WidgetTopBarProps): ReactElement {
    const { pagination, selectionCount, ...rest } = props;

    return (
        <div {...rest} className="widget-datagrid-top-bar table-header">
            <div className="widget-datagrid-padding-top">
                {selectionCount}
                {pagination && <div className="widget-datagrid-tb-end">{pagination}</div>}
            </div>
        </div>
    );
}
