import classNames from "classnames";
import { createElement } from "react";
import { useSelect } from "downshift";

interface Option {
    value: string;
    label: string;
}

interface FilterSelectorProps {
    ariaLabel?: string;
    value: string;
    onChange: (value: string) => void;
    options: Option[];
}

const itemToString = (item: Option | null): string => (item ? item.label : "");

export function FilterSelector(props: FilterSelectorProps): React.ReactElement {
    const { isOpen, selectedItem, highlightedIndex, getToggleButtonProps, getMenuProps, getItemProps } = useSelect({
        items: props.options,
        itemToString,
        initialSelectedItem: props.options.find(option => option.value === props.value),
        onSelectedItemChange: ({ selectedItem }) => props.onChange(selectedItem.value)
    });
    const listboxLabel = props.ariaLabel || "Select filter type";
    const buttonLabel = selectedItem?.label || listboxLabel;
    const buttonProps = getToggleButtonProps({ "aria-label": buttonLabel });

    return (
        <div className="filter-selector">
            <div className="filter-selector-content">
                <button
                    className={classNames("btn btn-default filter-selector-button button-icon", props.value)}
                    {...buttonProps}
                >
                    &nbsp;
                </button>
                <ul className="filter-selectors" {...getMenuProps({ "aria-label": listboxLabel })}>
                    {isOpen &&
                        props.options.map((item, index) => (
                            <li
                                className={classNames("filter-listitem", {
                                    "filter-selected": selectedItem?.value === item.value,
                                    "filter-highlighted": highlightedIndex === index
                                })}
                                key={item.value}
                                {...getItemProps({ item, index })}
                            >
                                <div className={classNames("filter-icon", item.value)} aria-hidden />
                                <div className="filter-label">{item.label}</div>
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    );
}
