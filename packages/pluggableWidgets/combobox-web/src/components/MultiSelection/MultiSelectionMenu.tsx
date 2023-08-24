import classNames from "classnames";
import { UseComboboxPropGetters } from "downshift";
import { ReactElement, createElement } from "react";
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
    // const allOptions = selector.options.getAll();
    // const allSelected = allOptions.length === selectedItems.length;
    // const noneSelected = selectedItems.length < 1;
    return (
        <div className={classNames("widget-combobox-menu", { "widget-combobox-menu-hidden": !isOpen })}>
            <ul className="widget-combobox-menu-list" {...getMenuProps?.({}, { suppressRefError: true })}>
                {isOpen &&
                    selectableItems.map((item, index) => (
                        <li
                            className={classNames("widget-combobox-item", {
                                "widget-combobox-item-highlighted": highlightedIndex === index
                            })}
                            key={item}
                            {...getItemProps?.({
                                item,
                                index
                            })}
                        >
                            <input
                                tabIndex={-1}
                                className="widget-combobox-item-checkbox"
                                type="checkbox"
                                checked={selector.currentValue?.includes(item)}
                                readOnly
                            />
                            {selector.caption.render(item)}
                        </li>
                    ))}
            </ul>
            {/* 
            NOTE: Disable footer as right now is not possible to translate text on buttons.
            <div className="widget-combobox-menu-footer">
                <TextButton onClick={() => !allSelected && setSelectedItems(allOptions)} disabled={allSelected}>Select all</TextButton>
                <TextButton onClick={() => !noneSelected && setSelectedItems([])} disabled={noneSelected}>Unselect all</TextButton>
            </div> */}
        </div>
    );
}

// interface TextButtonProps {
//     onClick: () => void;
//     disabled?: boolean;
//     children?: ReactNode;
// }

// function TextButton({ disabled, children, onClick }: TextButtonProps): ReactElement {
//     return (
//         <button
//             tabIndex={0}
//             role="button"
//             className={classNames("widget-combobox-menu-footer-control", {
//                 "widget-combobox-menu-footer-control-disabled": disabled
//             })}
//             onClick={onClick}
//         >
//             {children}
//         </button>
//     );
// }
