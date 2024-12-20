/* eslint-disable prefer-arrow-callback */
import { createElement, Fragment, forwardRef } from "react";
import cn from "classnames";

const rootName = "dropdown-filter";

export const DropdownRoot = forwardRef<HTMLDivElement, JSX.IntrinsicElements["div"]>(function DropdownRoot(props, ref) {
    return <div {...props} className={cn("form-control", rootName, props.className)} ref={ref} />;
});

export const DropdownButton = forwardRef<HTMLButtonElement, JSX.IntrinsicElements["button"]>(function DropdownButton(
    props,
    ref
) {
    return <button {...props} className={`${rootName}-button`} ref={ref} />;
});

export const DropdownInput = forwardRef<HTMLInputElement, JSX.IntrinsicElements["input"]>(function DropdownInput(
    props,
    ref
) {
    return <input {...props} className={cn(`${rootName}-input`, props.className)} ref={ref} />;
});

export const DropdownClear = forwardRef<HTMLButtonElement, JSX.IntrinsicElements["button"]>(function DropdownClear(
    props,
    ref
) {
    return <button {...props} className={`${rootName}-clear`} ref={ref} />;
});

export const DropdownToggle = forwardRef<HTMLButtonElement, JSX.IntrinsicElements["button"]>(function DropdownToggle(
    props,
    ref
) {
    const isOpen = true;
    return (
        <button {...props} className={`${rootName}-toggle`} tabIndex={-1} ref={ref}>
            {isOpen ? <Fragment>&#8593;</Fragment> : <Fragment>&#8595;</Fragment>}
        </button>
    );
});

export const DropdownMenu = forwardRef<HTMLUListElement, JSX.IntrinsicElements["ul"]>(function DropdownMenu(
    props,
    ref
) {
    return (
        <ul {...props} ref={ref}>
            {props.children}
        </ul>
    );
});
