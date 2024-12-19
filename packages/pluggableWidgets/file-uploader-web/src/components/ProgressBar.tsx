import { createElement, ReactElement } from "react";

interface ProgressBarProps {
    visible: boolean;
    indeterminate: boolean;
    percentage?: `${number}%`;
}

export function ProgressBar(props: ProgressBarProps): ReactElement {
    if (!props.visible) {
        return <div />;
    }

    if (props.indeterminate) {
        return (
            <div className={"progress-bar active-indeterminate"}>
                <div className="progress-bar-indicator"></div>
            </div>
        );
    }
    return (
        <div className={"progress-bar active"} style={{ "--progress-bar-percentage": props.percentage } as any}>
            <div className="progress-bar-indicator"></div>
        </div>
    );
}
