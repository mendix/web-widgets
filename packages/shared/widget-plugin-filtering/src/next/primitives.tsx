/* eslint-disable prefer-arrow-callback */
import { createElement, Fragment, forwardRef } from "react";
import cn from "classnames";

const rootName = "dropdown-filter";

export const Root = forwardRef<HTMLDivElement, JSX.IntrinsicElements["div"]>(function Root(props, ref) {
    return <div {...props} className={cn("form-control", rootName, props.className)} ref={ref} />;
});

export const ValueButton = forwardRef<HTMLButtonElement, JSX.IntrinsicElements["button"]>(function ValueButton(
    props,
    ref
) {
    return <button {...props} className={`${rootName}-button`} ref={ref} />;
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
        <ul {...props} ref={ref}>
            {props.children}
        </ul>
    );
});
