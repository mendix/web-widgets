import { createElement, PropsWithChildren, Fragment } from "react";
import cn from "classnames";

const rootName = "dropdown";

export function DropdownRoot(props: PropsWithChildren<{ className: string }>): React.ReactElement {
    return <div className={cn("form-control", rootName, props.className)}>{props.children}</div>;
}

export function DropdownButton(props: PropsWithChildren): React.ReactElement {
    return <button className={`${rootName}-button`}>{props.children}</button>;
}

export function DropdownInput(): React.ReactElement {
    return <input className={`${rootName}-input`} />;
}

export function DropdownClear() {
    return <button className={`${rootName}-clear`}>x</button>;
}

export function DropdownToggle(): React.ReactElement {
    return (
        <button className={`${rootName}-toggle`} tabIndex={-1}>
            {true ? <Fragment>&#8593;</Fragment> : <Fragment>&#8595;</Fragment>}
        </button>
    );
}

export function DropdownMenu(props: PropsWithChildren): React.ReactElement {
    return <ul>{props.children}</ul>;
}
