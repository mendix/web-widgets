import { createElement, FC, ReactElement, useCallback } from "react";
import classNames from "classnames";
import * as Progress from "@radix-ui/react-progress";

import { CloseIcon } from "./icons/CloseIcon";
import { WarningIcon } from "./icons/WarningIcon";

type ProgressModalProps = {
    failed?: boolean;
    onCancel?: () => void;
    open: boolean;
    progress: number;
    total?: number;
};

export const ProgressModal: FC<ProgressModalProps> = ({
    failed,
    onCancel,
    open,
    progress,
    total
}): ReactElement | null => {
    const isPercentage = Boolean(total);
    const modalContent = isPercentage ? `${progress} / ${total}` : progress;
    const indicatorStyle = isPercentage
        ? { transform: `translateX(-${100 - calculatePercentage(progress, 0, total!)}%)` }
        : {};

    const onCloseClick = useCallback(() => {
        if (onCancel) {
            onCancel();
        }
    }, [onCancel]);

    if (!open) {
        return null;
    }

    return (
        <div>
            <div className="widget-datagrid-modal-overlay" />

            <div className="widget-datagrid-modal-content">
                <button
                    className="btn btn-image btn-icon close-button widget-datagrid-modal-close"
                    onClick={onCloseClick}
                >
                    <CloseIcon />
                </button>

                <div
                    className={classNames("widget-datagrid-modal-description", {
                        "widget-datagrid-modal-warning": failed
                    })}
                >
                    {failed ? <WarningIcon /> : <p>{modalContent}</p>}
                </div>

                <Progress.Root className="widget-datagrid-modal-progress" value={progress} max={total}>
                    <Progress.Indicator
                        className={classNames("widget-datagrid-modal-progress-indicator", {
                            "widget-datagrid-modal-progress-indicator-warning": failed,
                            "widget-datagrid-modal-progress-indicator-indeterminate": !isPercentage
                        })}
                        style={indicatorStyle}
                    />
                </Progress.Root>
            </div>
        </div>
    );
};

function calculatePercentage(currentValue: number, minValue: number, maxValue: number): number {
    if (currentValue < minValue) {
        return 0;
    }
    if (currentValue > maxValue) {
        return 100;
    }
    const range = maxValue - minValue;
    const percentage = Math.round(((currentValue - minValue) / range) * 100);
    return Math.abs(percentage);
}
