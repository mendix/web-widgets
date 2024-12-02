import classNames from "classnames";
import { Fragment, createElement } from "react";
import { Option } from "../../typings/OptionListFilterInterface";
import { SelectControl } from "../kit/SelectControl";
import { useSelect } from "../kit/useSelect";

interface SelectProps {
    options: Option[];
    value: string;
    onSelect: (value: string | null) => void;
}

export function Select(props: SelectProps): React.ReactElement {
    const {
        open,
        triggerProps,
        listboxProps,
        getItemProps,
        selectedItem,
        highlightedIndex,
        floatingStyles,
        clearProps
    } = useSelect(props);
    return (
        <Fragment>
            <style>{`
            .select-menu {
                margin: 0;
                padding: 0;
                list-style: none;
                background: #fff;
            }
            .highlighted {
                background-color: #f0f0f0;
            }
            .selected {
                background-color: #0077cc;
                color: white;
            }
            `}</style>
            <SelectControl triggerProps={triggerProps} clearProps={clearProps}>
                {props.value || "Select"}
            </SelectControl>
            <ul
                className={classNames("select-menu", { "select-menu-hidden": !open, "select-menu-visible": open })}
                {...listboxProps}
                style={floatingStyles}
            >
                {open &&
                    props.options.map((item, index) => (
                        <li
                            className={classNames("select-menu-item", {
                                selected: selectedItem?.value === item.value,
                                highlighted: highlightedIndex === index
                            })}
                            key={item.value}
                            {...getItemProps({ item, index })}
                        >
                            <span className="select-menu-label">{item.caption}</span>
                        </li>
                    ))}
            </ul>
        </Fragment>
    );
}
