import { createElement, Fragment, ReactElement } from "react";
import { Cross } from "../picker-primitives";

type ClearButtonClassNamesProps = {
    clear?: string;
    clearIcon?: string;
    separator?: string;
};

type ClearButtonProps = {
    cls: ClearButtonClassNamesProps;
    onClick?: () => void;
    showSeparator?: boolean;
    visible: boolean;
};

export function ClearButton(props: ClearButtonProps): ReactElement | null {
    const { cls, onClick, showSeparator, visible } = props;
    return visible ? (
        <Fragment>
            <button className={cls.clear} tabIndex={-1} aria-label="Clear combobox" onClick={onClick}>
                <Cross className={cls.clearIcon} />
            </button>
            {showSeparator && <div className={cls.separator} role="presentation" />}
        </Fragment>
    ) : null;
}
