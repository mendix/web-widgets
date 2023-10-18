import { createElement, FC, ReactElement } from "react";
import classNames from "classnames";
import * as Dialog from "@radix-ui/react-dialog";
import * as Progress from "@radix-ui/react-progress";

import { CloseIcon } from "./icons/CloseIcon";
import { WarningIcon } from "./icons/WarningIcon";

type ProgressModalProps = {
    failed?: boolean;
    onCancel: () => void;
    open: boolean;
    progress: number;
    total?: number;
};

export const ProgressModal: FC<ProgressModalProps> = (props): ReactElement => {
    const isPercentage = Boolean(props.total);
    const modalContent = isPercentage ? `${props.progress} / ${props.total}` : props.progress;
    const indicatorStyle = isPercentage
        ? { transform: `translateX(-${100 - calculatePercentage(props.progress, 0, props.total!)}%)` }
        : {};

    return (
        <Dialog.Root open={props.open} onOpenChange={props.onCancel}>
            {props.open && <div className="widget-datagrid-modal-overlay" />}

            <Dialog.Content className="widget-datagrid-modal-content">
                <Dialog.Close asChild>
                    <button
                        className="btn btn-image btn-icon close-button widget-datagrid-modal-close"
                        onClick={props.onCancel}
                    >
                        <CloseIcon />
                    </button>
                </Dialog.Close>

                <Dialog.Description
                    className={classNames("widget-datagrid-modal-description", {
                        "widget-datagrid-modal-warning": props.failed
                    })}
                >
                    {props.failed ? <WarningIcon /> : <p>{modalContent}</p>}
                </Dialog.Description>

                <Progress.Root className="widget-datagrid-modal-progress" value={props.progress} max={props.total}>
                    <Progress.Indicator
                        className={classNames("widget-datagrid-modal-progress-indicator", {
                            "widget-datagrid-modal-progress-indicator-warning": props.failed,
                            "widget-datagrid-modal-progress-indicator-indeterminate": !isPercentage
                        })}
                        style={indicatorStyle}
                    />
                </Progress.Root>
            </Dialog.Content>
        </Dialog.Root>
    );
};

function calculatePercentage(currentValue: number, minValue: number = 0, maxValue: number): number {
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
