import classNames from "classnames";
import { CSSProperties, ReactElement, ReactNode } from "react";

export type WidgetContentProps = {
    className?: string;
    children?: ReactNode;
    style?: CSSProperties;
};

export function WidgetContent({ children, className }: WidgetContentProps): ReactElement {
    return <div className={classNames("widget-datagrid-content", className)}>{children}</div>;
}
