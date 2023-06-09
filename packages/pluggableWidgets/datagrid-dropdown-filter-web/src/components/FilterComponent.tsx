import {
    createElement,
    CSSProperties,
    Fragment,
    ReactElement,
    UIEventHandler,
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";
import { useOnClickOutside, usePositionObserver } from "@mendix/pluggable-widgets-commons/dist/components/web";
import { useWatchValues } from "@mendix/pluggable-widgets-commons/dist/hooks/useWatchValues";
import classNames from "classnames";
import { createPortal } from "react-dom";
import { Option, OptionValue } from "../utils/types";
import { useSelectState } from "../features/select";
import { EMPTY_OPTION_VALUE, finalizeOptions, parseInitValues } from "../features/setup";

const PreventReactErrorsAboutReadOnly = (): void => {
    return undefined;
};

export interface FilterComponentProps {
    ariaLabel?: string;
    className?: string;
    initialSelected?: string;
    status?: JSX.Element;
    footer?: JSX.Element;
    emptyOptionCaption?: string;
    multiSelect?: boolean;
    id?: string;
    options: Option[];
    tabIndex?: number;
    styles?: CSSProperties;
    updateFilters?: (values: Option[]) => void;
    onTriggerClick?: () => void;
    onContentScroll?: UIEventHandler<HTMLDivElement>;
}

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
    onContentScroll?: UIEventHandler<HTMLDivElement>;
}

function SelectComponent(props: SelectProps): ReactElement {
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
    const [dropdownWidth, setDropdownWidth] = useState(0);
    const componentRef = useRef<HTMLDivElement>(null);
    const optionsRef = useRef<HTMLDivElement>(null);
    const position = usePositionObserver(componentRef.current, show);
    const isSelected = within(selected);

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

    const renderContent = (): JSX.Element => {
        const hasOptions = options.length > 0;
        const optionsList = hasOptions ? (
            <ul
                id={`${id}-dropdown-list`}
                className="dropdown-list dropdown-content-section"
                role="menu"
                data-focusindex={0}
            >
                {options.map((option, index) => (
                    <li
                        className={classNames({
                            "filter-selected": !multiSelect && isSelected(option.value)
                        })}
                        key={`val:${option.value}`}
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
                            } else if (
                                (e.key === "Tab" && (index + 1 === options.length || (e.shiftKey && index === 0))) ||
                                e.key === "Escape"
                            ) {
                                e.preventDefault();
                                setShow(false);
                                componentRef.current?.querySelector("input")?.focus();
                            }
                        }}
                        role="menuitem"
                        tabIndex={0}
                    >
                        {multiSelect ? (
                            <Fragment>
                                <input
                                    id={`${id}_checkbox_toggle_${index}`}
                                    type="checkbox"
                                    checked={isSelected(option.value)}
                                    onChange={PreventReactErrorsAboutReadOnly}
                                />
                                <label htmlFor={`${id}_checkbox_toggle_${index}`} style={{ pointerEvents: "none" }}>
                                    {option.caption}
                                </label>
                            </Fragment>
                        ) : (
                            <div className="filter-label">{option.caption}</div>
                        )}
                    </li>
                ))}
            </ul>
        ) : null;

        return createPortal(
            <div
                className="dropdown-content"
                onScroll={onContentScroll}
                ref={optionsRef}
                style={{
                    position: "fixed",
                    width: dropdownWidth,
                    top: position?.bottom,
                    left: position?.left
                }}
            >
                {optionsList}
                {footer}
            </div>,
            document.body
        );
    };

    const containerClick = useCallback(() => {
        setShow(show => !show);
        setTimeout(() => {
            (optionsRef.current?.querySelector('[role="menuitem"]') as HTMLElement)?.focus();
        }, 10);
        if (onTriggerClick) {
            onTriggerClick();
        }
    }, [onTriggerClick]);

    const renderFormControl = (): ReactElement => {
        if (status) {
            return status;
        }

        return (
            <input
                value={inputValue}
                placeholder={placeholder}
                className="form-control dropdown-triggerer"
                onClick={containerClick}
                onChange={PreventReactErrorsAboutReadOnly}
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
                aria-controls={`${id}-dropdown-list`}
                aria-label={ariaLabel}
            />
        );
    };

    return (
        <div
            className={classNames("dropdown-container", className)}
            data-focusindex={tabIndex ?? 0}
            ref={componentRef}
            style={styles}
        >
            {renderFormControl()}
            {show ? renderContent() : null}
        </div>
    );
}

function within(selected: OptionValue[]): (value: OptionValue) => boolean {
    return value => selected.includes(value);
}

export function FilterComponent(props: FilterComponentProps): ReactElement {
    const multiSelect = !!props.multiSelect;
    const options = finalizeOptions(props.options, { multiSelect, emptyOptionCaption: props.emptyOptionCaption });
    const [state, { toggle, setSelected }] = useSelectState(options, parseInitValues(props.initialSelected ?? ""));

    const onSelect = useCallback((value: string) => {
        if (multiSelect) {
            toggle(value);
        } else {
            setSelected(value === EMPTY_OPTION_VALUE ? [] : [value]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useSetInitialConditionEffect(props.updateFilters, options, state.selected);

    useWatchValues(
        (_, [selected]) => {
            props.updateFilters?.(selected.length > 0 ? options.filter(o => selected.includes(o.value)) : []);
        },
        [state.selected]
    );

    return (
        <SelectComponent
            ariaLabel={props.ariaLabel}
            className={props.className}
            footer={props.footer}
            id={props.id}
            inputValue={state.inputValue}
            multiSelect={multiSelect}
            onSelect={onSelect}
            options={options}
            selected={state.selected}
            status={props.status}
            styles={props.styles}
            tabIndex={props.tabIndex}
            placeholder={props.emptyOptionCaption}
            onContentScroll={props.onContentScroll}
            onTriggerClick={props.onTriggerClick}
        />
    );
}

function useSetInitialConditionEffect(
    updateFilters: ((values: Option[]) => void) | undefined,
    options: Option[],
    selected: string[]
): void {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => updateFilters?.(options.filter(o => selected.includes(o.value))), []);
}
