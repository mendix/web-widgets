import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import * as Progress from "@radix-ui/react-progress";
import classNames from "classnames";
import { createElement, ReactElement, useState } from "react";
import { CloseIcon } from "./icons/CloseIcon";
import { WarningIcon } from "./icons/WarningIcon";

export type ExportAlertProps = {
    alertLabel: string;
    cancelLabel: string;
    failed: boolean;
    onCancel: (() => void) | undefined;
    progress: number;
    total: number | undefined;
};

export function ExportAlert({
    alertLabel,
    cancelLabel,
    failed,
    onCancel,
    progress,
    total
}: ExportAlertProps): ReactElement {
    const [id] = useState(() => `widget-datagrid-export-alert-${generateUUID()}`);

    return (
        <div
            id={id}
            className={classNames("widget-datagrid-export-alert", {
                "widget-datagrid-export-alert-failed": failed
            })}
            role="status"
            aria-live="off"
            aria-label={alertLabel}
        >
            <button
                role="button"
                className="btn btn-image btn-icon widget-datagrid-export-alert-cancel"
                onClick={onCancel}
                aria-label={cancelLabel}
                tabIndex={0}
            >
                <CloseIcon />
            </button>

            <div className="widget-datagrid-export-alert-message">
                {failed ? <WarningIcon /> : <p>{isValidTotal(total) ? formatStats(progress, total) : progress}</p>}
            </div>
            <ExportProgress progress={progress} total={total} />
        </div>
    );
}

function ExportProgress({ progress, total }: { progress: number; total: number | undefined }): ReactElement {
    const validTotal = isValidTotal(total) && total;
    return (
        <Progress.Root className="widget-datagrid-export-progress" value={validTotal ? progress : null} max={total}>
            <Progress.Indicator
                className={classNames("widget-datagrid-export-progress-indicator", {
                    "widget-datagrid-export-progress-indicator-indeterminate": !validTotal
                })}
                style={validTotal ? getIndicatorStyle(progress, total) : undefined}
            />
        </Progress.Root>
    );
}

function isValidTotal(total: number | undefined): total is number {
    return typeof total === "number" && total > 0;
}

function formatStats(progress: number, total: number): string {
    return `${progress} / ${total}`;
}

function getIndicatorStyle(progress: number, total: number): React.CSSProperties {
    return { transform: `translateX(-${100 - calculatePercentage(progress, 0, total)}%)` };
}

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
