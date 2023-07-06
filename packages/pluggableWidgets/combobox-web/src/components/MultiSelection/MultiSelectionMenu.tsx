import { UseComboboxPropGetters } from "downshift";
import { createElement } from "react";
import { createPortal } from "react-dom";
import classNames from "classnames";
import { MultiSelector } from "../../helpers/types";

interface MultiSelectionMenuProps extends Partial<UseComboboxPropGetters<any>> {
    isOpen: boolean;
    items: string[];
    highlightedIndex: number | null;
    comboboxSize: DOMRect | undefined;
    selector: MultiSelector;
    // selector: SingleSelector;
    // selectedItem?: string | null;
}

export function MultiSelectionMenu(props: MultiSelectionMenuProps) {
    const { isOpen, getMenuProps, getItemProps, highlightedIndex, comboboxSize, selector, items } = props;

    return createPortal(
        <ul
            {...getMenuProps?.()}
            className={classNames("widget-combobox-menu", { "widget-combobox-menu-hidden": !isOpen })}
            style={{
                width: comboboxSize?.width,
                left: comboboxSize?.x,
                top: (comboboxSize?.top || 0) + (comboboxSize?.height || 0),
                listStyle: "none"
            }}
        >
            {isOpen &&
                items.map((item, index) => (
                    <li
                        className={classNames("widget-combobox-item", {
                            // "widget-combobox-item-selected": selector.currentValue === item,
                            "widget-combobox-item-highlighted": highlightedIndex === index
                        })}
                        key={`${item}${index}`}
                        {...getItemProps?.({
                            item,
                            index
                        })}
                    >
                        <input
                            className="widget-combobox-item-checkbox"
                            type="checkbox"
                            checked={selector.currentValue?.includes(item)}
                        />
                        {selector.caption.render(item)}
                    </li>
                ))}
        </ul>,
        document.body
    );
}
