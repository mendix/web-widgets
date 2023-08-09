import classNames from "classnames";
import { UseComboboxPropGetters } from "downshift";
import { ReactElement, createElement } from "react";
import { Selector } from "../../helpers/types";

interface MultiSelectionMenuProps extends Partial<UseComboboxPropGetters<any>> {
    isOpen: boolean;
    selectableItems: string[];
    selectedItems: string[];
    highlightedIndex: number | null;
    comboboxSize: DOMRect | undefined;
    selector: Selector<string[]>;
    withCheckbox: boolean;
    setSelectedItems: (v: string[]) => void;
}

export function MultiSelectionMenu({
    isOpen,
    getMenuProps,
    getItemProps,
    highlightedIndex,
    comboboxSize,
    selector,
    selectableItems,
    withCheckbox,
    selectedItems,
    setSelectedItems
}: MultiSelectionMenuProps): ReactElement {
    const allSelected = selector.options.getAll().length === selectedItems.length;
    const noneSelected = selectedItems.length < 1;
    return (
        <div
            className={classNames("widget-combobox-menu", { "widget-combobox-menu-hidden": !isOpen })}
            style={{
                width: comboboxSize?.width
            }}
        >
            <ul style={{ padding: 0 }} {...getMenuProps?.({}, { suppressRefError: true })}>
                {isOpen &&
                    selectableItems.map((item, index) => (
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
                                    tabIndex={-1}
                                    className="widget-combobox-item-checkbox"
                                    type="checkbox"
                                    checked={selector.currentValue?.includes(item)}
                                    // eslint-disable-next-line
                                    onChange={() => {}}
                                />
                            )}
                            {selector.caption.render(item)}
                        </li>
                    ))}
                <div className="widget-combobox-menu-footer">
                    <button
                        tabIndex={0}
                        role="button"
                        className={classNames("widget-combobox-menu-footer-control", {
                            "widget-combobox-menu-footer-control-disabled": allSelected
                        })}
                        onClick={() => {
                            if (!allSelected) {
                                setSelectedItems(selector.options.getAll());
                            }
                        }}
                    >
                        Select All
                    </button>
                    <button
                        tabIndex={0}
                        role="button"
                        className={classNames("widget-combobox-menu-footer-control", {
                            "widget-combobox-menu-footer-control-disabled": noneSelected
                        })}
                        onClick={() => {
                            if (!noneSelected) {
                                setSelectedItems([]);
                            }
                        }}
                    >
                        Unselect All
                    </button>
                </div>
            </ul>
        </div>
    );
}
