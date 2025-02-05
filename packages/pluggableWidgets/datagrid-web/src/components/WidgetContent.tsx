import classNames from "classnames";
import { ReactElement, ReactNode, createElement } from "react";

export type WidgetContentProps = {
    className?: string;
    children?: ReactNode;
    style?: React.CSSProperties;
};

export function WidgetContent({ children, className }: WidgetContentProps): ReactElement {
    return <div className={classNames("widget-datagrid-content", className)}>{children}</div>;
}
