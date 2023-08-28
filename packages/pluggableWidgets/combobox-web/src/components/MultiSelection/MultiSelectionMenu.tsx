import classNames from "classnames";
import { UseComboboxPropGetters } from "downshift";
import { ReactElement, createElement } from "react";
import { Checkbox } from "../../assets/icons";
import { MultiSelector } from "../../helpers/types";

interface MultiSelectionMenuProps extends Partial<UseComboboxPropGetters<any>> {
    isOpen: boolean;
    selectableItems: string[];
    selectedItems: string[];
    highlightedIndex: number | null;
    selector: MultiSelector;
    setSelectedItems: (v: string[]) => void;
}

export function MultiSelectionMenu({
    isOpen,
    getMenuProps,
    getItemProps,
    highlightedIndex,
    selector,
    selectableItems
}: MultiSelectionMenuProps): ReactElement {
    return (
        <div className={classNames("widget-combobox-menu", { "widget-combobox-menu-hidden": !isOpen })}>
            <ul className="widget-combobox-menu-list" {...getMenuProps?.({}, { suppressRefError: true })}>
                {isOpen &&
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
                                {selector.selectedItemsStyle === "text" && (
                                    <Checkbox checked={selector.currentValue?.includes(item)} />
                                )}
                                {selector.caption.render(item)}
                            </li>
                        );
                    })}
            </ul>
        </div>
    );
}
