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
import { useOnClickOutside, usePositionObserver } from "@mendix/pluggable-widgets-commons/components/web";
import classNames from "classnames";
import deepEqual from "deep-equal";
import { createPortal } from "react-dom";

const PreventReactErrorsAboutReadOnly = (): void => {
    return undefined;
};

export interface FilterOption {
    caption: string;
    value: string;
}

export type FilterValueChangeCallback = (values: FilterOption[]) => void;

export interface FilterComponentProps {
    ariaLabel?: string;
    className?: string;
    defaultValue?: string;
    status?: JSX.Element;
    footer?: JSX.Element;
    emptyOptionCaption?: string;
    multiSelect?: boolean;
    id?: string;
    options: FilterOption[];
    tabIndex?: number;
    styles?: CSSProperties;
    updateFilters?: FilterValueChangeCallback;
    onTriggerClick?: () => void;
    onContentScroll?: UIEventHandler<HTMLDivElement>;
}

export function FilterComponent(props: FilterComponentProps): ReactElement {
    const {
        ariaLabel,
        className,
        defaultValue,
        status,
        footer,
        emptyOptionCaption,
        multiSelect,
        id,
        options: optionsProp,
        tabIndex,
        styles,
        updateFilters,
        onTriggerClick,
        onContentScroll
    } = props;
    const [valueInput, setValueInput] = useState("");
    const [options, setOptions] = useState<FilterOption[]>([]);
    const [selectedFilters, setSelectedFilters] = useState<FilterOption[]>([]);
    const [show, setShow] = useState(false);
    const [dropdownWidth, setDropdownWidth] = useState(0);
    const defaultValuesLoaded = useRef<boolean>(false);

    const componentRef = useRef<HTMLDivElement>(null);
    const optionsRef = useRef<HTMLDivElement>(null);

    const position = usePositionObserver(componentRef.current, show);

    const setMultiSelectFilters = useCallback(
        (selectedOptions: FilterOption[]) => {
            if (selectedOptions?.length === 0) {
                setValueInput(emptyOptionCaption ?? "");
                setSelectedFilters([]);
            } else {
                setValueInput(selectedOptions.map(option => option.caption).join(","));
                setSelectedFilters(prev => {
                    if (deepEqual(selectedOptions, prev, { strict: true })) {
                        return prev;
                    }
                    return selectedOptions;
                });
            }
        },
        [emptyOptionCaption]
    );

    const onClick = useCallback(
        (option: FilterOption) => {
            if (multiSelect) {
                setMultiSelectFilters(toggleFilter(selectedFilters, option));
            } else {
                setValueInput(option.caption);
                setSelectedFilters([option]);
                setShow(false);
            }
        },
        [selectedFilters, multiSelect, setMultiSelectFilters]
    );

    useOnClickOutside([componentRef, optionsRef], () => setShow(false));

    // Select the first option Or default option on load
    useEffect(() => {
        if (!defaultValuesLoaded.current && options.length > 0) {
            if (multiSelect) {
                if (defaultValue) {
                    const initialOptions = defaultValue
                        .split(",")
                        .map(value => options.find(option => option.value === value))
                        .filter(Boolean) as FilterOption[];

                    // User can set anything, but it could not match so we have to set to empty or ""
                    setMultiSelectFilters(initialOptions);
                } else {
                    setValueInput(emptyOptionCaption ?? "");
                }
            } else {
                // We want to add empty option caption
                const initialOption = options.find(option => option.value === defaultValue) ?? options[0];

                setValueInput(initialOption?.caption ?? "");
                setSelectedFilters(prev => {
                    const newValue = [initialOption];
                    if (deepEqual(newValue, prev, { strict: true })) {
                        return prev;
                    }
                    return newValue;
                });
            }
            defaultValuesLoaded.current = true;
        }
    }, [defaultValue, emptyOptionCaption, multiSelect, options, setMultiSelectFilters]);

    useEffect(() => {
        const emptyOption = multiSelect
            ? []
            : [
                  {
                      caption: emptyOptionCaption ?? "",
                      value: ""
                  }
              ];
        const options = [...emptyOption, ...optionsProp];
        setOptions(prev => {
            if (deepEqual(prev, options, { strict: true })) {
                return prev;
            }
            return options;
        });

        // Resets the option to reload default values
        defaultValuesLoaded.current = false;
    }, [emptyOptionCaption, multiSelect, optionsProp, defaultValue]);

    // This side effect meant to sync filter value with parents
    // But, because updateFilters is might be "unstable" function
    // we don't pass it to deps array, as then it may produce
    // infinite loop
    useEffect(() => {
        updateFilters?.(selectedFilters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFilters]);

    const showPlaceholder = selectedFilters.length === 0 || valueInput === emptyOptionCaption;

    const renderContent = (): JSX.Element => {
        const hasOptions = options.length > (multiSelect ? 0 : 1);
        const optionsList = hasOptions ? (
            <ul
                id={`${id}-dropdown-list`}
                className="dropdown-list dropdown-content-section"
                role="menu"
                data-focusindex={0}
            >
                {hasOptions &&
                    options.map((option, index) => (
                        <li
                            className={classNames({
                                "filter-selected": !multiSelect && isSelected(selectedFilters, option)
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
                                    (e.key === "Tab" &&
                                        (index + 1 === options.length || (e.shiftKey && index === 0))) ||
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
                                        checked={isSelected(selectedFilters, option)}
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
                    left: position?.left,
                    zIndex: 102
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
            (optionsRef.current?.querySelector("li.filter-selected") as HTMLElement)?.focus();
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
                value={!showPlaceholder ? valueInput : ""}
                placeholder={showPlaceholder ? emptyOptionCaption : undefined}
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

function hasSameValue(a: FilterOption): (b: FilterOption) => boolean {
    return b => a.value === b.value;
}

function toggleFilter(filters: FilterOption[], filterToToggle: FilterOption): FilterOption[] {
    const alteredFilters = [...filters];
    const index = filters.findIndex(hasSameValue(filterToToggle));
    if (index > -1) {
        alteredFilters.splice(index, 1);
    } else {
        alteredFilters.push(filterToToggle);
    }

    return alteredFilters;
}

function isSelected(selected: FilterOption[], option: FilterOption): boolean {
    return !!selected.find(hasSameValue(option));
}
