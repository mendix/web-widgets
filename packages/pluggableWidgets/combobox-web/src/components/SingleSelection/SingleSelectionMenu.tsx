import classNames from "classnames";
import { PropGetters } from "downshift/typings";
import { createElement, ReactElement } from "react";
import { SingleSelector } from "../../helpers/types";
import { EmptyItemPlaceholder } from "../Placeholder";

interface ComboboxMenuProps extends Partial<PropGetters<any>> {
    isOpen: boolean;
    selector: SingleSelector;
    highlightedIndex: number | null;
    selectedItem?: string | null;
    placeholderText?: string | null;
}

export function SingleSelectionMenu({
    isOpen,
    selector,
    highlightedIndex,
    getMenuProps,
    getItemProps,
    placeholderText
}: ComboboxMenuProps): ReactElement {
    const items = selector.options.getAll();
    return (
        <div className={classNames("widget-combobox-menu", { "widget-combobox-menu-hidden": !isOpen })}>
            <ul className="widget-combobox-menu-list" {...getMenuProps?.({}, { suppressRefError: true })}>
                {isOpen ? (
                    items.length > 0 ? (
                        items.map((item, index) => (
                            <li
                                className={classNames("widget-combobox-item", {
                                    "widget-combobox-item-selected": selector.currentValue === item,
                                    "widget-combobox-item-highlighted": highlightedIndex === index
                                })}
                                key={item}
                                {...getItemProps?.({
                                    index,
                                    item
                                })}
                            >
                                {selector.caption.render(item)}
                            </li>
                        ))
                    ) : (
                        <EmptyItemPlaceholder>{placeholderText}</EmptyItemPlaceholder>
                    )
                ) : null}
            </ul>
        </div>
    );
}
