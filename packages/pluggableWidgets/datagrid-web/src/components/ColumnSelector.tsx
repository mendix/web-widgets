import {
    autoUpdate,
    FloatingFocusManager,
    size,
    useClick,
    useDismiss,
    useFloating,
    useInteractions
} from "@floating-ui/react";
import { createElement, ReactElement, useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { GridColumn } from "../typings/GridColumn";
import { FaEye } from "./icons/FaEye";

export interface ColumnSelectorProps {
    columns: GridColumn[];
    id?: string;
    label?: string;
    visibleLength: number;
}

export function ColumnSelector(props: ColumnSelectorProps): ReactElement {
    const { visibleLength } = props;
    const [show, setShow] = useState(false);
    const [maxHeight, setMaxHeight] = useState<number>(0);
    const { refs, floatingStyles, context, update } = useFloating({
        open: show,
        placement: "bottom-end",
        strategy: "fixed",
        onOpenChange: setShow,
        middleware: [
            size({
                apply({ availableHeight }) {
                    flushSync(() => {
                        setMaxHeight(availableHeight);
                    });
                }
            })
        ],
        transform: false
    });

    useEffect(() => {
        if (!show || !refs.reference.current || !refs.floating.current) {
            return;
        }
        return autoUpdate(refs.reference.current, refs.floating.current, update);
    }, [show, refs.reference, refs.floating, update]);

    const dismiss = useDismiss(context);
    const click = useClick(context);
    const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

    const label = props.label ?? "Column selector";

    const firstHidableColumnIndex = useMemo(() => props.columns.findIndex(c => c.canHide), [props.columns]);
    const lastHidableColumnIndex = useMemo(() => props.columns.map(c => c.canHide).lastIndexOf(true), [props.columns]);

    const optionsComponent = (
        <ul
            ref={refs.setFloating}
            id={`${props.id}-column-selectors`}
            className={`column-selectors`}
            data-focusindex={0}
            role="menu"
            style={{ ...floatingStyles, maxHeight }}
            {...getFloatingProps()}
        >
            {props.columns.map((column, index) => {
                const isVisible = !column.isHidden;
                const isLastVisibleColumn = isVisible && visibleLength === 1;
                const onClick = (): void => {
                    if (!isLastVisibleColumn) {
                        column.toggleHidden();
                    }
                };
                return column.canHide ? (
                    <li
                        key={column.columnId}
                        onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            onClick();
                        }}
                        onKeyDown={e => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                onClick();
                            } else if (
                                (e.key === "Tab" &&
                                    (index === lastHidableColumnIndex ||
                                        (e.shiftKey && index === firstHidableColumnIndex))) ||
                                e.key === "Escape"
                            ) {
                                e.preventDefault();
                                setShow(false);
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
                            {column.header.trim() || "<...>"}
                        </label>
                    </li>
                ) : null;
            })}
        </ul>
    );

    return (
        <div aria-label={label} className="th column-selector" role="columnheader" title={label}>
            <div className="column-selector-content">
                <button
                    aria-label={label}
                    ref={refs.setReference}
                    className="btn btn-default column-selector-button"
                    onKeyDown={e => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    }}
                    {...getReferenceProps()}
                    aria-haspopup
                    aria-expanded={show}
                    aria-controls={`${props.id}-column-selectors`}
                >
                    <FaEye />
                </button>
            </div>
            {show && (
                <FloatingFocusManager context={context} modal={false}>
                    {optionsComponent}
                </FloatingFocusManager>
            )}
        </div>
    );
}

function onChangeStub(): void {
    // Stub to prevent react warnings in unit tests
}
