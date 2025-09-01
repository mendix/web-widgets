import { createElement, Fragment, PropsWithChildren, ReactElement } from "react";

type IfProps = {
    condition: boolean;
} & PropsWithChildren;

export function If({ condition, children }: IfProps): ReactElement | null {
    return condition ? <Fragment>{children}</Fragment> : null;
}
