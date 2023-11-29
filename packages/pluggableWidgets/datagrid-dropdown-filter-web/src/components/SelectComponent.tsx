import { useOnClickOutside } from "@mendix/widget-plugin-hooks/useOnClickOutside";
import { usePositionObserver } from "@mendix/widget-plugin-hooks/usePositionObserver";
import classNames from "classnames";
import { createElement, CSSProperties, ReactElement, UIEventHandler, useCallback, useRef, useState } from "react";
import { Option, OptionValue } from "../utils/types";
import { FilterContentComponent } from "./FilterContentComponent";
import { FormControlComponent } from "./FormControlComponent";

interface SelectProps {
    options: Option[];
    selected: OptionValue[];
    inputValue: string;
    multiSelect: boolean;
    placeholder?: string;
    ariaLabel?: string;
    className?: string;
    initialSelected?: string;
    status?: JSX.Element;
    footer?: JSX.Element;
    id?: string;
    tabIndex?: number;
    styles?: CSSProperties;
    onSelect: (value: OptionValue) => void;
    onTriggerClick?: () => void;
    onContentScroll?: UIEventHandler<HTMLUListElement>;
}

export function SelectComponent(props: SelectProps): ReactElement {
    const {
        ariaLabel,
        className,
        status,
        footer,
        id,
        options,
        selected,
        inputValue,
        placeholder,
        multiSelect,
        tabIndex,
        styles,
        onSelect,
        onTriggerClick,
        onContentScroll
    } = props;
    const [show, setShow] = useState(false);
    const componentRef = useRef<HTMLDivElement>(null);
    const optionsRef = useRef<HTMLDivElement>(null);
    const position = usePositionObserver(componentRef.current || null, show);

    const onClick = useCallback(
        (option: Option) => {
            onSelect(option.value);
            if (!multiSelect) {
                setShow(false);
            }
        },
        [onSelect, multiSelect]
    );

    useOnClickOutside([componentRef, optionsRef], () => setShow(false));

    const onBlur = useCallback(() => {
        setShow(false);
        componentRef.current?.querySelector("input")?.focus();
    }, [setShow]);

    const containerClick = useCallback(() => {
        setShow(show => !show);
        setTimeout(() => {
            (optionsRef.current?.querySelector('[role="menuitem"]') as HTMLElement)?.focus();
        }, 10);
        if (onTriggerClick) {
            onTriggerClick();
        }
    }, [onTriggerClick]);

    return (
        <div
            className={classNames("dropdown-container", className)}
            data-focusindex={tabIndex ?? 0}
            ref={componentRef}
            style={styles}
        >
            <FormControlComponent
                ariaLabel={ariaLabel}
                status={status}
                id={id}
                inputValue={inputValue}
                placeholder={placeholder}
                show={show}
                onContainerClick={containerClick}
            />
            {show ? (
                <FilterContentComponent
                    position={position}
                    footer={footer}
                    id={id}
                    options={options}
                    multiSelect={multiSelect}
                    onContentScroll={onContentScroll}
                    selected={selected}
                    onOptionClick={onClick}
                    onBlur={onBlur}
                    ref={optionsRef}
                    width={componentRef.current?.clientWidth}
                />
            ) : null}
        </div>
    );
}
