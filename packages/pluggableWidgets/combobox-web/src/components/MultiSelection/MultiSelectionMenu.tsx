import { UseComboboxPropGetters } from "downshift/typings";
import { ReactElement, createElement, ReactNode, Fragment } from "react";
import { Checkbox, SelectAll } from "../../assets/icons";
import { MultiSelector } from "../../helpers/types";
import { ComboboxMenuWrapper } from "../ComboboxMenuWrapper";
import { ComboboxOptionWrapper } from "../ComboboxOptionWrapper";

interface MultiSelectionMenuProps extends Partial<UseComboboxPropGetters<string>> {
    isOpen: boolean;
    selectableItems: string[];
    selectedItems: string[];
    highlightedIndex: number | null;
    selector: MultiSelector;
    noOptionsText?: string;
    selectAllButtonAriaLabel: string;
    inputId?: string;
    showFooter: boolean;
    menuFooterContent?: ReactNode;
}

export function MultiSelectionMenu({
    isOpen,
    getMenuProps,
    getItemProps,
    highlightedIndex,
    selector,
    selectableItems,
    noOptionsText,

    selectAllButtonAriaLabel,
    inputId
    showFooter,
    menuFooterContent
}: MultiSelectionMenuProps): ReactElement {
    return (
        <ComboboxMenuWrapper
            isOpen={isOpen}
            isEmpty={selectableItems.length <= 0}
            getMenuProps={getMenuProps}
            noOptionsText={noOptionsText}
            selectAllButtonEnabled={selector.selectAllButton}
            selectAllButtonEnabled={selector.selectAllButton}
            showFooter={showFooter}
            menuFooterContent={menuFooterContent}
        >
            {isOpen &&
                selectableItems.map((item, index) => {
                    const isActive = highlightedIndex === index;
                    const isSelected = selector.currentValue?.includes(item);

                    return (
                        <ComboboxOptionWrapper
                            key={item}
                            isHighlighted={isActive}
                            isSelected={isSelected}
                            item={item}
                            getItemProps={getItemProps}
                            index={index}
                        >
                            {item === selector.selectAllButtonId ? (
                                <button
                                    className="widget-combobox-menu-select-all-button"
                                    aria-label={selectAllButtonAriaLabel}
                                    tabIndex={-1}
                                >
                                    <SelectAll
                                        allSelected={selector.isAllOptionsSelected()}
                                        highlighted={highlightedIndex === 0}
                                    />
                                </button>
                            ) : (
                                <Fragment>
                                    {selector.selectionMethod === "checkbox" && (
                                        <Checkbox checked={isSelected} id={`${inputId}_${item}`} />
                                    )}
                                    {selector.caption.render(item, "options", `${inputId}_${item}`)}
                                </Fragment>
                            )}
                        </ComboboxOptionWrapper>
                    );
                })}
        </ComboboxMenuWrapper>
    );
}
