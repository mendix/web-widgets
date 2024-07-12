import { createElement, useRef, Fragment } from "react";

export function withPreloader<P extends object>(
    Component: (props: P) => React.ReactElement,
    isLoading: (props: P) => boolean
): (props: P) => React.ReactElement {
    return function Preloader(props: P) {
        const isLoaded = (useRef(false).current ||= !isLoading(props));
        return isLoaded ? <Component {...props} /> : <Fragment />;
    };
}
