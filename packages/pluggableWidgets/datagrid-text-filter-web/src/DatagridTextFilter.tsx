import * as mobx from "mobx";
import { observer } from "mobx-react-lite";
import { getGlobalFilterContextObject, isStringFilter } from "@mendix/widget-plugin-filtering";
import { createElement, ReactElement, useRef, useContext, Fragment } from "react";
import { DatagridTextFilterContainerProps } from "../typings/DatagridTextFilterProps";
import { FilterComponent } from "./components/FilterComponent";

import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { String_InputFilterInterface } from "@mendix/widget-plugin-filtering/dist/stores/typings/InputFilterInterface";

(document as any)._mobx = mobx;

type FilterAPI = {
    filterStore: String_InputFilterInterface;
    parentChannelName?: string;
};

const filterContext = getGlobalFilterContextObject();

const Widget = withFilterAPI(withPreloader(observer(ReactiveDatagridTextFilter)));

export default function DatagridTextFilter(props: DatagridTextFilterContainerProps): ReactElement {
    return <Widget {...props} />;
}

function ReactiveDatagridTextFilter(props: DatagridTextFilterContainerProps & FilterAPI): ReactElement {
    const id = (useRef<string>().current ??= `TextFilter${generateUUID()}`);
    return (
        <FilterComponent
            adjustable={props.adjustable}
            className={props.class}
            defaultFilter={props.defaultFilter}
            defaultValue={props.defaultValue?.value}
            changeDelay={props.delay}
            id={id}
            placeholder={props.placeholder?.value}
            screenReaderButtonCaption={props.screenReaderButtonCaption?.value}
            screenReaderInputCaption={props.screenReaderInputCaption?.value}
            styles={props.style}
            tabIndex={props.tabIndex}
            parentChannelName={props.parentChannelName ?? null}
            name={props.name}
            filterStore={props.filterStore}
            type="text"
        />
    );
}

function withFilterAPI<T>(Component: (props: T & FilterAPI) => ReactElement): (props: T) => ReactElement {
    return function APIGuard(props) {
        const filterAPI = useContext(filterContext);

        if (!filterAPI || filterAPI.store?.storeType !== "input" || !isStringFilter(filterAPI.store)) {
            return <div>Error</div>;
        }

        return <Component {...props} filterStore={filterAPI.store} parentChannelName={filterAPI.eventsChannelName} />;
    };
}

function withPreloader<P extends DatagridTextFilterContainerProps>(
    Component: (props: P) => React.ReactElement
): (props: P) => React.ReactElement {
    return function Preloader(props) {
        const isLoaded = (useRef(false).current ||= !isLoadingDefaultValues(props));
        return isLoaded ? <Component {...props} /> : <Fragment />;
    };
}

function isLoadingDefaultValues(props: DatagridTextFilterContainerProps): boolean {
    const statusList = [props.defaultValue?.status];
    return statusList.some(status => status === "loading");
}
