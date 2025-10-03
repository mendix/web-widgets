import { KeyboardEvent, MouseEvent, ReactElement, useCallback } from "react";
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

const stopKeyDown = (e: KeyboardEvent<HTMLButtonElement>): void => {
    if (e.key === "Enter" || e.key === " ") {
        e.stopPropagation();
    }
};

export function ClearButton(props: ClearButtonProps): ReactElement | null {
    const { cls, onClick, visible } = props;

    const onClickHandler = useCallback(
        (e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            e.preventDefault();
            if (onClick) {
                onClick();
            }
        },
        [onClick]
    );

    return visible ? (
        <button className={cls.clear} aria-label="Clear selection" onClick={onClickHandler} onKeyDown={stopKeyDown}>
            <Cross className={cls.clearIcon} />
        </button>
    ) : null;
}
