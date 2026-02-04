import classNames from "classnames";
import { ReactElement } from "react";

type RefreshIndicatorProps = {
    className?: string;
};

export function RefreshIndicator({ className }: RefreshIndicatorProps): ReactElement {
    return (
        <div>
            <div className={classNames("mx-refresh-container", className)}>
                <progress className="mx-refresh-indicator" />
            </div>
        </div>
    );
}
