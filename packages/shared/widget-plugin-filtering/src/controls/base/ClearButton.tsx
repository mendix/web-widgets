import { createElement, ReactElement, useCallback } from "react";
import { Cross } from "../picker-primitives";

type ClearButtonClassNamesProps = {
    clear?: string;
    clearIcon?: string;
    separator?: string;
};

type ClearButtonProps = {
    cls: ClearButtonClassNamesProps;
    onClick?: () => void;
    visible: boolean;
};

export function ClearButton(props: ClearButtonProps): ReactElement | null {
    const { cls, onClick, visible } = props;

    const onClickHandler = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            e.preventDefault();
            if (onClick) {
                onClick();
            }
        },
        [onClick]
    );

    return visible ? (
        <button className={cls.clear} aria-label="Clear selection" onClick={onClickHandler}>
            <Cross className={cls.clearIcon} />
        </button>
    ) : null;
}
