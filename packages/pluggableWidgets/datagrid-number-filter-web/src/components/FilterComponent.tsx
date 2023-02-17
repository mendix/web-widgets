import { FilterSelector } from "@mendix/widget-kit-web/ui/FilterSelector";
import { debounce } from "@mendix/widget-kit-web/util";
import { Big } from "big.js";
import classNames from "classnames";
import { createElement, CSSProperties, ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { DefaultFilterEnum } from "../../typings/DatagridNumberFilterProps";

interface FilterComponentProps {
    adjustable: boolean;
    className?: string;
    defaultFilter: DefaultFilterEnum;
    delay: number;
    id?: string;
    placeholder?: string;
    screenReaderButtonCaption?: string;
    screenReaderInputCaption?: string;
    tabIndex?: number;
    styles?: CSSProperties;
    updateFilters?: (value: Big | undefined, type: DefaultFilterEnum) => void;
    value?: Big;
}

export function FilterComponent(props: FilterComponentProps): ReactElement {
    const [type, setType] = useState<DefaultFilterEnum>(props.defaultFilter);
    const [value, setValue] = useState<Big | undefined>(undefined);
    const [valueInput, setValueInput] = useState<string | undefined>("");
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [[onChange, abortSetValue]] = useState(() => debounce((value?: Big) => setValue(value), props.delay));

    useEffect(() => {
        setValueInput(props.value?.toString() ?? "");
        setValue(props.value);
    }, [props.value]);

    useEffect(() => {
        props.updateFilters?.(value, type);
    }, [value, type]);

    const focusInput = useCallback(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [inputRef]);

    // abortSetValue computed just once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => abortSetValue, []);

    const onFilterTypeChange = useCallback(
        type => {
            setType(prev => {
                if (prev === type) {
                    return prev;
                }
                focusInput();
                return type;
            });
        },
        [focusInput]
    );

    return (
        <div
            className={classNames("filter-container", props.className)}
            data-focusindex={props.tabIndex ?? 0}
            style={props.styles}
        >
            {props.adjustable && (
                <FilterSelector
                    ariaLabel={props.screenReaderButtonCaption}
                    id={props.id}
                    defaultFilter={props.defaultFilter}
                    onChange={onFilterTypeChange}
                    options={
                        [
                            { value: "greater", label: "Greater than" },
                            { value: "greaterEqual", label: "Greater than or equal" },
                            { value: "equal", label: "Equal" },
                            { value: "notEqual", label: "Not equal" },
                            { value: "smaller", label: "Smaller than" },
                            { value: "smallerEqual", label: "Smaller than or equal" },
                            { value: "empty", label: "Empty" },
                            { value: "notEmpty", label: "Not empty" }
                        ] as Array<{ value: DefaultFilterEnum; label: string }>
                    }
                />
            )}
            <input
                aria-label={props.screenReaderInputCaption}
                className={classNames("form-control", { "filter-input": props.adjustable })}
                disabled={type === "empty" || type === "notEmpty"}
                onChange={e => {
                    const value = e.target.value;
                    if (value && !isNaN(Number(value))) {
                        setValueInput(value);
                        onChange(new Big(Number(value)));
                    } else {
                        setValueInput(value);
                        onChange(undefined);
                    }
                }}
                placeholder={props.placeholder}
                ref={inputRef}
                type="number"
                value={valueInput}
            />
        </div>
    );
}
