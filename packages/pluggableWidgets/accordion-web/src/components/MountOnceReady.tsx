import { createElement, ReactNode, useRef, Fragment } from "react";

export function MountOnceReady(props: { ready: boolean; children: ReactNode }): JSX.Element | null {
    const { ready, children } = props;
    const isReady = useRef(false);

    isReady.current = isReady.current || ready;

    if (!isReady.current || !children) {
        return null;
    }

    return <Fragment>{children}</Fragment>;
}
