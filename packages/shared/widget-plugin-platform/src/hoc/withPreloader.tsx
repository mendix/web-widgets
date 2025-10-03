import { createElement, Fragment, ReactElement, useRef } from "react";

export function withPreloader<P extends object>(
    Component: (props: P) => ReactElement,
    isLoading: (props: P) => boolean
): (props: P) => ReactElement {
    return function Preloader(props: P) {
        const isLoaded = (useRef(false).current ||= !isLoading(props));
        return isLoaded ? <Component {...props} /> : <Fragment />;
    };
}
