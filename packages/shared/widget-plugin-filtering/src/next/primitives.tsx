/* eslint-disable prefer-arrow-callback */
import { createElement, forwardRef } from "react";

type ClassKeys =
    | "root"
    | "valueButton"
    | "input"
    | "clear"
    | "toggle"
    | "menu"
    | "menuSlot"
    | "menuItem"
    | "popover"
    | "stateIcon";

export function classes(rootName = "widget-dropdown-filter"): Record<ClassKeys, string> {
    return {
        root: rootName,
        valueButton: `${rootName}-value-button`,
        input: `${rootName}-input`,
        clear: `${rootName}-clear`,
        toggle: `${rootName}-toggle`,
        menu: `${rootName}-menu`,
        menuSlot: `${rootName}-menu-slot`,
        menuItem: `${rootName}-menu-item`,
        popover: `${rootName}-popover`,
        stateIcon: `${rootName}-state-icon`
    };
}

export const Root = forwardRef<HTMLDivElement, JSX.IntrinsicElements["div"]>(function Root(props, ref) {
    return <div {...props} ref={ref} />;
});

export const ValueButton = forwardRef<HTMLButtonElement, JSX.IntrinsicElements["button"]>(function ValueButton(
    props,
    ref
) {
    return <button {...props} ref={ref} />;
});

export const Input = forwardRef<HTMLInputElement, JSX.IntrinsicElements["input"]>(function Input(props, ref) {
    return <input {...props} ref={ref} />;
});

export const Clear = forwardRef<HTMLButtonElement, JSX.IntrinsicElements["button"]>(function Clear(props, ref) {
    return <button {...props} ref={ref} />;
});

export const Toggle = forwardRef<HTMLButtonElement, JSX.IntrinsicElements["button"]>(function Toggle(props, ref) {
    return <button {...props} tabIndex={-1} ref={ref} />;
});

export const Menu = forwardRef<HTMLUListElement, JSX.IntrinsicElements["ul"]>(function Menu(props, ref) {
    return <ul {...props} ref={ref} />;
});

export const MenuItem = forwardRef<HTMLLIElement, JSX.IntrinsicElements["li"]>(function MenuItem(props, ref) {
    return <li {...props} ref={ref} />;
});

export const Popover = forwardRef<HTMLDivElement, JSX.IntrinsicElements["div"]>(function Popover(props, ref) {
    return <div {...props} ref={ref} />;
});

export const MenuSlot = forwardRef<HTMLDivElement, JSX.IntrinsicElements["div"]>(function MenuSlot(props, ref) {
    return <div {...props} ref={ref} />;
});

export function Arrow(props: JSX.IntrinsicElements["svg"]): React.ReactElement {
    return (
        <svg width="16" height="16" viewBox="0 0 32 32" {...props}>
            <path d="M16 23.41L4.29004 11.71L5.71004 10.29L16 20.59L26.29 10.29L27.71 11.71L16 23.41Z" />
        </svg>
    );
}
