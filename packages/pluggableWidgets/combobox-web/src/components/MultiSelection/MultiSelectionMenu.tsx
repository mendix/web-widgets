import { UseComboboxPropGetters } from "downshift";
import { ReactPortal, createElement } from "react";
import { createPortal } from "react-dom";
import classNames from "classnames";
import { MultiSelector } from "../../helpers/types";

interface MultiSelectionMenuProps extends Partial<UseComboboxPropGetters<any>> {
    isOpen: boolean;
    items: string[];
    highlightedIndex: number | null;
    comboboxSize: DOMRect | undefined;
    selector: MultiSelector;
    withCheckbox: boolean;
    allItems: string[];
}

export function MultiSelectionMenu({
    isOpen,
    getMenuProps,
    getItemProps,
    highlightedIndex,
    comboboxSize,
    selector,
    items,
    withCheckbox,
    allItems
}: MultiSelectionMenuProps): ReactPortal {
    return createPortal(
        <div
            className={classNames("widget-combobox-menu", { "widget-combobox-menu-hidden": !isOpen })}
            {...getMenuProps?.()}
            style={{
                width: comboboxSize?.width,
                left: comboboxSize?.x,
                top: (comboboxSize?.top || 0) + (comboboxSize?.height || 0)
            }}
        >
            <ul style={{ padding: 0 }}>
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
            </ul>
            <div className="widget-combobox-menu-footer">
                <span
                    className="widget-combobox-menu-footer-control"
                    onClick={() => {
                        selector.setValue(allItems);
                    }}
                >
                    Select All
                </span>
                <span
                    className="widget-combobox-menu-footer-control"
                    onClick={() => {
                        selector.setValue([]);
                    }}
                >
                    Unselect All
                </span>
            </div>
            ;
        </div>,
        document.body
    );
}
