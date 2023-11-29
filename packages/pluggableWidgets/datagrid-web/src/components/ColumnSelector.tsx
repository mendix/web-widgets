import { createElement, Dispatch, ReactElement, SetStateAction, useCallback, useMemo, useRef, useState } from "react";
import { FaEye } from "./icons/FaEye";
import { useOnClickOutside } from "@mendix/widget-plugin-hooks/useOnClickOutside";
import { usePositionObserver } from "@mendix/widget-plugin-hooks/usePositionObserver";
import { GridColumn } from "../typings/GridColumn";
import { useIsElementInViewport } from "../utils/useIsElementInViewport";

export interface ColumnSelectorProps {
    columns: GridColumn[];
    hiddenColumns: number[];
    id?: string;
    setHiddenColumns: Dispatch<SetStateAction<number[]>>;
    label?: string;
    visibleLength: number;
}

export function ColumnSelector(props: ColumnSelectorProps): ReactElement {
    const { setHiddenColumns, visibleLength } = props;
    const [show, setShow] = useState(false);
    const optionsRef = useRef<HTMLUListElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const position = usePositionObserver(buttonRef.current, show);
    const isOnlyOneColumnVisible = visibleLength === 1;

    useOnClickOutside([buttonRef, optionsRef], () => setShow(false));

    const label = props.label ?? "Column selector";

    const isInViewport = useIsElementInViewport(optionsRef);

    const onClick = useCallback(
        (isVisible: boolean, columnNumber: number) => {
            const isLastVisibleColumn = isVisible && isOnlyOneColumnVisible;
            if (!isLastVisibleColumn) {
                setHiddenColumns(prev => {
                    if (!isVisible) {
                        return prev.filter(v => v !== columnNumber);
                    } else {
                        return [...prev, columnNumber];
                    }
                });
            }
        },
        [setHiddenColumns, isOnlyOneColumnVisible]
    );

    const firstHidableColumnIndex = useMemo(() => props.columns.findIndex(c => c.canHide), [props.columns]);
    const lastHidableColumnIndex = useMemo(() => props.columns.map(c => c.canHide).lastIndexOf(true), [props.columns]);

    const optionsComponent = (
        <ul
            ref={optionsRef}
            id={`${props.id}-column-selectors`}
            className={`column-selectors ${isInViewport ? "" : "overflow"}`}
            data-focusindex={0}
            role="menu"
            style={{
                position: "fixed",
                top: position?.bottom,
                right: position?.right !== undefined ? document.body.clientWidth - position.right : undefined
            }}
        >
            {props.columns.map((column: GridColumn, index) => {
                const isVisible = !props.hiddenColumns.includes(column.columnNumber);
                const isLastVisibleColumn = isVisible && isOnlyOneColumnVisible;
                return column.canHide ? (
                    <li
                        key={column.columnNumber}
                        onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            onClick(isVisible, column.columnNumber);
                        }}
                        onKeyDown={e => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                onClick(isVisible, column.columnNumber);
                            } else if (
                                (e.key === "Tab" &&
                                    (index === lastHidableColumnIndex ||
                                        (e.shiftKey && index === firstHidableColumnIndex))) ||
                                e.key === "Escape"
                            ) {
                                e.preventDefault();
                                setShow(false);
                                buttonRef.current?.focus();
                            }
                        }}
                        role="menuitem"
                        tabIndex={0}
                    >
                        <input
                            checked={isVisible}
                            disabled={isLastVisibleColumn}
                            id={`${props.id}_checkbox_toggle_${index}`}
                            style={{ pointerEvents: "none" }}
                            type="checkbox"
                            tabIndex={-1}
                            onChange={onChangeStub}
                        />
                        <label htmlFor={`${props.id}_checkbox_toggle_${index}`} style={{ pointerEvents: "none" }}>
                            {column.header}
                        </label>
                    </li>
                ) : null;
            })}
        </ul>
    );

    const containerClick = useCallback(() => {
        setShow(show => !show);
        setTimeout(() => {
            (optionsRef.current?.querySelector("li") as HTMLElement)?.focus();
        }, 10);
    }, []);

    return (
        <div aria-label={label} className="th column-selector" role="columnheader" title={label}>
            <div className="column-selector-content">
                <button
                    aria-label={label}
                    ref={buttonRef}
                    className="btn btn-default column-selector-button"
                    onClick={containerClick}
                    onKeyDown={e => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            containerClick();
                        }
                    }}
                    aria-haspopup
                    aria-expanded={show}
                    aria-controls={`${props.id}-column-selectors`}
                >
                    <FaEye />
                </button>
            </div>
            {show && optionsComponent}
        </div>
    );
}

function onChangeStub(): void {
    // Stub to prevent react warnings in unit tests
}
