import { createElement, useRef, Fragment } from "react";
import { DatagridDateFilterContainerProps } from "../../typings/DatagridDateFilterProps";
import { isLoadingDefaultValues } from "../utils/widget-utils";

export function withPreloader<P extends DatagridDateFilterContainerProps>(
    Component: (props: P) => React.ReactElement
): (props: P) => React.ReactElement {
    return function Preloader(props) {
        const isLoaded = (useRef(false).current ||= !isLoadingDefaultValues(props));
        return isLoaded ? <Component {...props} /> : <Fragment />;
    };
}
