/* eslint-disable prefer-arrow-callback */
import { createElement, Fragment, forwardRef } from "react";
import cn from "classnames";

const rootName = "widget-dropdown-filter";

export const Root = forwardRef<HTMLDivElement, JSX.IntrinsicElements["div"]>(function Root(props, ref) {
    return <div {...props} className={cn("form-control", rootName, props.className)} ref={ref} />;
});

export const ValueButton = forwardRef<HTMLButtonElement, JSX.IntrinsicElements["button"]>(function ValueButton(
    props,
    ref
) {
    return <button {...props} className={`${rootName}-value-button`} ref={ref} />;
});

export const Input = forwardRef<HTMLInputElement, JSX.IntrinsicElements["input"]>(function Input(props, ref) {
    return <input {...props} className={cn(`${rootName}-input`, props.className)} ref={ref} />;
});

export const Clear = forwardRef<HTMLButtonElement, JSX.IntrinsicElements["button"]>(function Clear(props, ref) {
    return <button {...props} className={`${rootName}-clear`} ref={ref} />;
});

export const Toggle = forwardRef<HTMLButtonElement, JSX.IntrinsicElements["button"]>(function Toggle(props, ref) {
    const isOpen = true;
    return (
        <button {...props} className={`${rootName}-toggle`} tabIndex={-1} ref={ref}>
            {isOpen ? <Fragment>&#8593;</Fragment> : <Fragment>&#8595;</Fragment>}
        </button>
    );
});

export const Menu = forwardRef<HTMLUListElement, JSX.IntrinsicElements["ul"]>(function Menu(props, ref) {
    return (
        <ul {...props} className={cn(`${rootName}-menu`, props.className)} ref={ref}>
            {props.children}
        </ul>
    );
});

export const MenuItem = forwardRef<HTMLLIElement, JSX.IntrinsicElements["li"]>(function MenuItem(props, ref) {
    return <li {...props} className={`${rootName}-menu-item`} ref={ref} />;
});

export const Popover = forwardRef<HTMLDivElement, JSX.IntrinsicElements["div"]>(function Popover(props, ref) {
    return <div {...props} className={cn(`${rootName}-popover`, props.className)} ref={ref} />;
});

export const MenuSlot = forwardRef<HTMLDivElement, JSX.IntrinsicElements["div"]>(function MenuSlot(props, ref) {
    return <div {...props} className={`${rootName}-menu-slot`} ref={ref} />;
});
