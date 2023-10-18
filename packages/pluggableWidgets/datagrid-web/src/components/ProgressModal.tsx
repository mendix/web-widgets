import { createElement, FC, ReactElement } from "react";
import classNames from "classnames";
import * as Dialog from "@radix-ui/react-dialog";
import * as Progress from "@radix-ui/react-progress";

import { CloseIcon } from "./icons/CloseIcon";
import { WarningIcon } from "./icons/WarningIcon";

type ProgressModalProps = {
    container?: HTMLElement | null;
    failed?: boolean;
    onCancel: () => void;
    open: boolean;
    progress: number;
    total?: number;
};

export const ProgressModal: FC<ProgressModalProps> = ({
    container,
    failed,
    onCancel,
    open,
    progress,
    total
}): ReactElement => {
    const isPercentage = Boolean(total);
    const modalContent = isPercentage ? `${progress} / ${total}` : progress;
    const indicatorStyle = isPercentage
        ? { transform: `translateX(-${100 - calculatePercentage(progress, 0, total!)}%)` }
        : {};

    return (
        <Dialog.Root open={open} onOpenChange={onCancel}>
            <Dialog.Portal container={container}>
                {open && <div className="widget-datagrid-modal-overlay" />}
                {/* <Dialog.Overlay className="widget-datagrid-modal-overlay" /> */}

                <Dialog.Content className="widget-datagrid-modal-content">
                    <Dialog.Close asChild>
                        <button
                            className="btn btn-image btn-icon close-button widget-datagrid-modal-close"
                            onClick={onCancel}
                        >
                            <CloseIcon />
                        </button>
                    </Dialog.Close>

                    <Dialog.Description
                        className={classNames("widget-datagrid-modal-description", {
                            "widget-datagrid-modal-warning": failed
                        })}
                    >
                        {failed ? <WarningIcon /> : <p>{modalContent}</p>}
                    </Dialog.Description>

                    <Progress.Root className="widget-datagrid-modal-progress" value={progress} max={total}>
                        <Progress.Indicator
                            className={classNames("widget-datagrid-modal-progress-indicator", {
                                "widget-datagrid-modal-progress-indicator-warning": failed,
                                "widget-datagrid-modal-progress-indicator-indeterminate": !isPercentage
                            })}
                            style={indicatorStyle}
                        />
                    </Progress.Root>
                </Dialog.Content>
            </Dialog.Portal>
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
