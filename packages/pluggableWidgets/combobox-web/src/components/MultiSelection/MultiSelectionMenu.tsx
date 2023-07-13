import classNames from "classnames";
import { UseComboboxPropGetters } from "downshift";
import { ReactPortal, createElement, useMemo } from "react";
import { createPortal } from "react-dom";
import { MultiSelector } from "../../helpers/types";

interface MultiSelectionMenuProps extends Partial<UseComboboxPropGetters<any>> {
    isOpen: boolean;
    selectableItems: string[];
    selectedItems: string[];
    highlightedIndex: number | null;
    comboboxSize: DOMRect | undefined;
    selector: MultiSelector;
    withCheckbox: boolean;
    allItems: string[];
    comboboxElement: HTMLDivElement | null;
}

export function MultiSelectionMenu({
    isOpen,
    getMenuProps,
    getItemProps,
    highlightedIndex,
    comboboxElement,
    selector,
    selectableItems: items,
    withCheckbox,
    allItems,
    selectedItems
}: MultiSelectionMenuProps): ReactPortal {
    const allSelected = allItems.length === selectedItems.length;
    const noneSelected = selectedItems.length < 1;
    const comboboxPosition = useMemo(() => {
        return comboboxElement?.getBoundingClientRect();
    }, [comboboxElement?.getBoundingClientRect()]);
    return createPortal(
        <div
            className={classNames("widget-combobox-menu", { "widget-combobox-menu-hidden": !isOpen })}
            style={{
                width: comboboxPosition?.width,
                left: comboboxPosition?.x,
                top: (comboboxPosition?.top || 0) + (comboboxPosition?.height || 0)
            }}
        >
            <ul style={{ padding: 0 }} {...getMenuProps?.({}, { suppressRefError: true })}>
                {isOpen &&
                    items.map((item, index) => (
                        <li
                            className={classNames("widget-combobox-item", {
                                "widget-combobox-item-highlighted": highlightedIndex === index
                            })}
                            key={`${item}${index}`}
                            {...getItemProps?.({
                                item,
                                index
                            })}
                        >
                            {withCheckbox && (
                                <input
                                    className="widget-combobox-item-checkbox"
                                    type="checkbox"
                                    checked={selector.currentValue?.includes(item)}
                                />
                            )}
                            {selector.caption.render(item)}
                        </li>
                    ))}
                <div className="widget-combobox-menu-footer">
                    <span
                        className={classNames("widget-combobox-menu-footer-control", {
                            "widget-combobox-menu-footer-control-disabled": allSelected
                        })}
                        onClick={() => {
                            if (!allSelected) {
                                selector.setValue(allItems);
                            }
                        }}
                    >
                        Select All
                    </span>
                    <span
                        className={classNames("widget-combobox-menu-footer-control", {
                            "widget-combobox-menu-footer-control-disabled": noneSelected
                        })}
                        onClick={() => {
                            if (!noneSelected) {
                                selector.setValue([]);
                            }
                        }}
                    >
                        Unselect All
                    </span>
                </div>
            </ul>
        </div>,
        document.body
    );
}
