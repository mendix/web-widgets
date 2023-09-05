import classNames from "classnames";
import { UseComboboxPropGetters } from "downshift";
import { ReactElement, createElement } from "react";
import { Checkbox } from "../../assets/icons";
import { MultiSelector } from "../../helpers/types";
import { EmptyItemPlaceholder } from "../Placeholder";

interface MultiSelectionMenuProps extends Partial<UseComboboxPropGetters<any>> {
    isOpen: boolean;
    selectableItems: string[];
    selectedItems: string[];
    highlightedIndex: number | null;
    selector: MultiSelector;
    setSelectedItems: (v: string[]) => void;
    placeholderText?: string | null;
}

export function MultiSelectionMenu({
    isOpen,
    getMenuProps,
    getItemProps,
    highlightedIndex,
    selector,
    selectableItems,
    placeholderText
}: MultiSelectionMenuProps): ReactElement {
    return (
        <div className={classNames("widget-combobox-menu", { "widget-combobox-menu-hidden": !isOpen })}>
            <ul className="widget-combobox-menu-list" {...getMenuProps?.({}, { suppressRefError: true })}>
                {isOpen ? (
                    selectableItems.length > 0 ? (
                        selectableItems.map((item, index) => {
                            const isActive = highlightedIndex === index;
                            const isSelected = selector.currentValue?.includes(item);
                            const itemProps = getItemProps?.({
                                item,
                                index
                            });
                            return (
                                <li
                                    className={classNames("widget-combobox-item", {
                                        "widget-combobox-item-highlighted": isSelected || isActive
                                    })}
                                    key={item}
                                    {...itemProps}
                                    aria-selected={isSelected}
                                >
                                    <Checkbox checked={selector.currentValue?.includes(item)} />
                                    {selector.caption.render(item)}
                                </li>
                            );
                        })
                    ) : (
                        <EmptyItemPlaceholder>{placeholderText}</EmptyItemPlaceholder>
                    )
                ) : null}
            </ul>
        </div>
    );
}
