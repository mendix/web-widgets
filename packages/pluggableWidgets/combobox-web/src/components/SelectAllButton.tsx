import { Fragment, ReactElement, createElement, useState } from "react";
import { SelectAll, UnselectAll } from "../assets/icons";

interface SelectAllButtonProps {
    setSelectedItems: (v: string[]) => void;
    selectableItems: string[];
    currentValue: string[] | null;
    selectAllButtonAriaLabel: string;
}

export function SelectAllButton({
    setSelectedItems,
    selectableItems,
    currentValue,
    selectAllButtonAriaLabel
}: SelectAllButtonProps): ReactElement {
    const allSelected = compareArrays(selectableItems, currentValue);
    const [isHovered, setIsHovered] = useState(false);
    return (
        <Fragment>
            <button
                className="widget-combobox-menu-header-select-all-button"
                aria-label={selectAllButtonAriaLabel}
                onClick={e => {
                    e.stopPropagation();
                    if (!allSelected) {
                        setSelectedItems(selectableItems);
                    } else {
                        setSelectedItems([]);
                    }
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {allSelected && isHovered ? <UnselectAll /> : <SelectAll allSelected={allSelected} />}
            </button>
        </Fragment>
    );
}

const compareArrays = (a: string[] | null, b: string[] | null): boolean | undefined => {
    return a && b ? a.length === b.length && a.every(element => b.includes(element)) : false;
};
