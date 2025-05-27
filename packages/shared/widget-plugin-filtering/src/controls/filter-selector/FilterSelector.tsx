import classNames from "classnames";
import { createElement, useMemo } from "react";
import { useSelect } from "./useSelect";

interface Option {
    value: string;
    label: string;
}

interface FilterSelectorProps {
    ariaLabel?: string;
    value: string;
    onSelect: (value: string) => void;
    options: Option[];
}

export function FilterSelector(props: FilterSelectorProps): React.ReactElement {
    const options = useMemo(
        () => props.options.map(option => ({ value: option.value, caption: option.label })),
        [props.options]
    );
    const {
        open,
        triggerProps: buttonProps,
        listboxProps,
        getItemProps,
        selectedItem,
        highlightedIndex,
        floatingStyles
    } = useSelect({ ...props, options });

    return (
        <div className="filter-selector">
            <div className="filter-selector-content">
                <button
                    className={classNames("btn btn-default filter-selector-button button-icon", props.value)}
                    {...buttonProps}
                >
                    &nbsp;
                </button>
                <ul
                    className={classNames("filter-selectors", { hidden: !open, visible: open })}
                    {...listboxProps}
                    style={floatingStyles}
                >
                    {open &&
                        options.map((item, index) => (
                            <li
                                className={classNames("filter-listitem", {
                                    "filter-selected": selectedItem?.value === item.value,
                                    "filter-highlighted": highlightedIndex === index
                                })}
                                key={item.value}
                                {...getItemProps({ item, index })}
                            >
                                <div className={classNames("filter-icon", item.value)} aria-hidden />
                                <div className="filter-label">{item.caption}</div>
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    );
}
