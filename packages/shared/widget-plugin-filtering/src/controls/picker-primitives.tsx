import { createElement } from "react";

type ClassKeys =
    | "root"
    | "input"
    | "clear"
    | "toggle"
    | "menu"
    | "menuSlot"
    | "menuItem"
    | "menuCheckbox"
    | "checkboxSlot"
    | "popover"
    | "stateIcon"
    | "clearIcon"
    | "inputContainer"
    | "selectedItem"
    | "removeIcon"
    | "separator"
    | "checkbox";

export function classes(rootName = "widget-dropdown-filter"): Record<ClassKeys, string> {
    return {
        root: rootName,
        input: `${rootName}-input`,
        clear: `${rootName}-clear`,
        toggle: `${rootName}-toggle`,
        menu: `${rootName}-menu`,
        menuSlot: `${rootName}-menu-slot`,
        menuItem: `${rootName}-menu-item`,
        menuCheckbox: `${rootName}-menu-checkbox`,
        checkboxSlot: `${rootName}-checkbox-slot`,
        popover: `${rootName}-popover`,
        stateIcon: `${rootName}-state-icon`,
        clearIcon: `${rootName}-clear-icon`,
        inputContainer: `${rootName}-input-container`,
        selectedItem: `${rootName}-selected-item`,
        removeIcon: `${rootName}-remove-icon`,
        separator: `${rootName}-separator`,
        checkbox: `${rootName}-checkbox`
    };
}

export function Arrow(props: JSX.IntrinsicElements["svg"]): React.ReactElement {
    return (
        <svg width="16" height="16" viewBox="0 0 32 32" {...props}>
            <path d="M16 23.41L4.29004 11.71L5.71004 10.29L16 20.59L26.29 10.29L27.71 11.71L16 23.41Z" />
        </svg>
    );
}

export function Cross(props: JSX.IntrinsicElements["svg"]): React.ReactElement {
    return (
        <svg width="14" height="14" viewBox="0 0 32 32" {...props}>
            <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="currentColor"
                d="M27.71 5.71004L26.29 4.29004L16 14.59L5.71004 4.29004L4.29004 5.71004L14.59 16L4.29004 26.29L5.71004 27.71L16 17.41L26.29 27.71L27.71 26.29L17.41 16L27.71 5.71004Z"
            />
        </svg>
    );
}
