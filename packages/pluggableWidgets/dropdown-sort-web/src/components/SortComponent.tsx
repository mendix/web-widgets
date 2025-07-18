import { useOnClickOutside } from "@mendix/widget-plugin-hooks/useOnClickOutside";
import { usePositionObserver } from "@mendix/widget-plugin-hooks/usePositionObserver";
import classNames from "classnames";
import { createElement, CSSProperties, ReactElement, useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface SortComponentProps<Dir = "asc" | "desc"> {
    className?: string;
    placeholder?: string;
    id?: string;
    options: Array<{
        caption: string;
        value: string;
    }>;
    value: string | null;
    direction: Dir;
    tabIndex?: number;
    screenReaderButtonCaption?: string;
    screenReaderInputCaption?: string;
    styles?: CSSProperties;
    onSelect?: (value: string) => void;
    onDirectionClick?: () => void;
}

export function SortComponent(props: SortComponentProps): ReactElement {
    const { onSelect } = props;
    const [show, setShow] = useState(false);
    const [dropdownWidth, setDropdownWidth] = useState(0);
    const componentRef = useRef<HTMLDivElement>(null);
    const optionsRef = useRef<HTMLUListElement>(null);
    const position = usePositionObserver(componentRef.current, show);

    const onClick = useCallback(
        (option: { value: string }) => {
            onSelect?.(option.value);
            setShow(false);
        },
        [onSelect]
    );

    useOnClickOutside([componentRef, optionsRef], () => setShow(false));

    const selected = props.options.find(o => o.value === props.value);

    const optionsComponent = createPortal(
        <ul
            ref={optionsRef}
            id={`${props.id}-dropdown-list`}
            className="dropdown-list"
            role="menu"
            data-focusindex={0}
            style={{ position: "fixed", width: dropdownWidth, top: position?.bottom, left: position?.left }}
        >
            {props.options.map((option, index) => (
                <li
                    className={classNames({
                        "filter-selected": props.value === option.value
                    })}
                    key={index}
                    onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        onClick(option);
                    }}
                    onKeyDown={e => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            onClick(option);
                        } else if (e.key === "Tab" && index + 1 === props.options.length) {
                            e.preventDefault();
                            setShow(false);
                            componentRef.current?.querySelector("button")?.focus();
                        } else if ((e.key === "Tab" && e.shiftKey && index === 0) || e.key === "Escape") {
                            e.preventDefault();
                            setShow(false);
                            componentRef.current?.querySelector("input")?.focus();
                        }
                    }}
                    role="menuitem"
                    tabIndex={0}
                >
                    <div className="filter-label">{option.caption}</div>
                </li>
            ))}
        </ul>,
        document.body
    );

    const containerClick = useCallback(() => {
        setShow(show => !show);
        setTimeout(() => {
            const selectedElement = optionsRef.current?.querySelector("li.filter-selected") as HTMLElement;
            const firstElement = optionsRef.current?.querySelector("li") as HTMLElement;
            (selectedElement || firstElement)?.focus();
        }, 10);
    }, []);

    return (
        <div
            className={classNames("dropdown-container", props.className)}
            data-focusindex={props.tabIndex ?? 0}
            ref={componentRef}
            style={props.styles}
        >
            <div className="dropdown-triggerer-wrapper">
                <input
                    value={props.value ? selected?.caption : ""}
                    placeholder={props.placeholder}
                    className="form-control dropdown-triggerer"
                    onClick={containerClick}
                    onKeyDown={e => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            containerClick();
                        }
                    }}
                    aria-haspopup
                    ref={inputRef => {
                        if (inputRef && inputRef.clientWidth) {
                            setDropdownWidth(inputRef.clientWidth);
                        }
                    }}
                    aria-expanded={show}
                    aria-controls={`${props.id}-dropdown-list`}
                    aria-label={props.screenReaderInputCaption}
                    onChange={() => {}}
                />
                <button
                    aria-label={props.screenReaderButtonCaption}
                    className={classNames("btn btn-default btn-sort", {
                        "icon-asc": props.direction === "asc",
                        "icon-desc": props.direction === "desc"
                    })}
                    onClick={props.onDirectionClick}
                />
            </div>
            {show && optionsComponent}
        </div>
    );
}
