import classNames from "classnames";
import { ReactElement, ReactNode, createElement } from "react";
import { SpinnerLoader } from "./loader/SpinnerLoader";

export type WidgetContentProps = {
    className?: string;
    children?: ReactNode;
    style?: React.CSSProperties;
    isLoading: boolean;
};

const Container = ({ children, className }: WidgetContentProps): ReactElement => {
    return <div className={classNames("widget-datagrid-content", className)}>{children}</div>;
};

export function WidgetContent(props: WidgetContentProps): ReactElement {
    if (props.isLoading) {
        return (
            <div className="widget-datagrid-loader-container">
                <SpinnerLoader withMargins size="large" />
            </div>
        );
    }

    return <Container {...props} />;
}
