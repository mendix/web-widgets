import * as mobx from "mobx";
import { observer } from "mobx-react-lite";
import { getGlobalFilterContextObject, isStringFilter } from "@mendix/widget-plugin-filtering";
import { createElement, ReactElement, useRef, useContext, Fragment } from "react";
import { DatagridTextFilterContainerProps } from "../typings/DatagridTextFilterProps";
import { FilterComponent } from "./components/FilterComponent";

// import { Alert } from "@mendix/widget-plugin-component-kit/Alert";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { String_InputFilterInterface } from "@mendix/widget-plugin-filtering/dist/stores/typings/InputFilterInterface";
// import { FilterType, getFilterDispatcher, useDefaultValue } from "@mendix/widget-plugin-filtering";

(document as any)._mobx = mobx;

// import {
//     attribute,
//     contains,
//     endsWith,
//     equals,
//     greaterThan,
//     greaterThanOrEqual,
//     lessThan,
//     lessThanOrEqual,
//     literal,
//     notEqual,
//     or,
//     startsWith
// } from "mendix/filters/builders";
// import { FilterCondition } from "mendix/filters";
// import { ListAttributeValue } from "mendix";
// import { translateFilters } from "./utils/filters";

// export default function DatagridTextFilter(props: DatagridTextFilterContainerProps): ReactElement {
//     const id = useRef(`TextFilter${generateUUID()}`);
//     const defaultValue = useDefaultValue(props.defaultValue);

//     const FilterContext = getFilterDispatcher();
//     const alertMessage = (
//         <Alert bootstrapStyle="danger">
//             The Text filter widget must be placed inside the header of the Data grid 2.0 or Gallery widget.
//         </Alert>
//     );
//     const alertMessageMultipleFilters = (
//         <Alert bootstrapStyle="danger">
//             The Text filter widget can&apos;t be used with the filters options you have selected. It requires a
//             &quot;Hashed string or String&quot; attribute to be selected.
//         </Alert>
//     );

//     return FilterContext?.Consumer ? (
//         <FilterContext.Consumer>
//             {filterContextValue => {
//                 if (
//                     !filterContextValue ||
//                     !filterContextValue.filterDispatcher ||
//                     (!filterContextValue.singleAttribute && !filterContextValue.multipleAttributes)
//                 ) {
//                     return alertMessage;
//                 }
//                 const {
//                     filterDispatcher,
//                     singleAttribute,
//                     multipleAttributes,
//                     singleInitialFilter,
//                     multipleInitialFilters
//                 } = filterContextValue;

//                 const attributes = [
//                     ...(singleAttribute ? [singleAttribute] : []),
//                     ...(multipleAttributes ? findAttributesByType(multipleAttributes) ?? [] : [])
//                 ];

//                 if (attributes.length === 0) {
//                     if (multipleAttributes) {
//                         return alertMessageMultipleFilters;
//                     }
//                     return alertMessage;
//                 }

//                 const parentFilter = singleInitialFilter
//                     ? translateFilters(singleInitialFilter)
//                     : translateFilters(multipleInitialFilters?.[attributes[0].id]);

//                 const errorMessage = getAttributeTypeErrorMessage(attributes[0].type);
//                 if (errorMessage) {
//                     return <Alert bootstrapStyle="danger">{errorMessage}</Alert>;
//                 }

//                 if (defaultValue === null) {
//                     return null;
//                 }

//                 return (
//                     <FilterComponent
//                         adjustable={props.adjustable}
//                         className={props.class}
//                         defaultFilter={parentFilter?.type ?? props.defaultFilter}
//                         value={parentFilter?.value ?? defaultValue}
//                         changeDelay={props.delay}
//                         id={id.current}
//                         placeholder={props.placeholder?.value}
//                         screenReaderButtonCaption={props.screenReaderButtonCaption?.value}
//                         screenReaderInputCaption={props.screenReaderInputCaption?.value}
//                         styles={props.style}
//                         tabIndex={props.tabIndex}
//                         parentChannelName={filterContextValue.eventsChannelName ?? null}
//                         name={props.name}
//                         onChange={(value: string, type: DefaultFilterEnum): void => {
//                             props.valueAttribute?.setValue(value);
//                             props.onChange?.execute();
//                             const conditions = attributes
//                                 ?.map(attribute => getFilterCondition(attribute, value, type))
//                                 .filter((filter): filter is FilterCondition => filter !== undefined);
//                             filterDispatcher({
//                                 getFilterCondition: () =>
//                                     conditions && conditions.length > 1 ? or(...conditions) : conditions?.[0],
//                                 filterType: FilterType.STRING
//                             });
//                         }}
//                     />
//                 );
//             }}
//         </FilterContext.Consumer>
//     ) : (
//         alertMessage
//     );
// }

// function findAttributesByType(multipleAttributes?: {
//     [key: string]: ListAttributeValue;
// }): ListAttributeValue[] | undefined {
//     if (!multipleAttributes) {
//         return undefined;
//     }
//     return Object.keys(multipleAttributes)
//         .map(key => multipleAttributes[key])
//         .filter(attr => attr.type.match(/HashString|String/));
// }

// function getAttributeTypeErrorMessage(type?: string): string | null {
//     return type && !type.match(/HashString|String/)
//         ? "The attribute type being used for Text filter is not 'Hashed string or String'"
//         : null;
// }

// function getFilterCondition(
//     listAttribute: ListAttributeValue,
//     value: string,
//     type: DefaultFilterEnum
// ): FilterCondition | undefined {
//     if (!listAttribute || !listAttribute.filterable || (type !== "empty" && type !== "notEmpty" && !value)) {
//         return undefined;
//     }

//     const filters = {
//         contains,
//         startsWith,
//         endsWith,
//         greater: greaterThan,
//         greaterEqual: greaterThanOrEqual,
//         equal: equals,
//         notEqual,
//         smaller: lessThan,
//         smallerEqual: lessThanOrEqual,
//         empty: equals,
//         notEmpty: notEqual
//     };

//     return filters[type](
//         attribute(listAttribute.id),
//         literal(type === "empty" || type === "notEmpty" ? undefined : value)
//     );
// }
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
