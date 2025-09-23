import classNames from "classnames";
import { ReactElement } from "react";

type RefreshIndicatorProps = {
    className?: string;
};

export function RefreshIndicator({ className }: RefreshIndicatorProps): ReactElement {
    return (
        <div className="tr" role="row">
            <div className={classNames("th mx-refresh-container", className)}>
                <progress className="mx-refresh-indicator" />
            </div>
        </div>
    );
}
