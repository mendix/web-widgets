import {
    DispatchFilterUpdate,
    AssociationProperties,
    getFilterAssociationProps
} from "@mendix/widget-plugin-filtering";
import { useLazyListValue } from "@mendix/widget-plugin-hooks/useLazyListValue";
import { useOnScrollBottom } from "@mendix/widget-plugin-hooks/useOnScrollBottom";
import { createElement, ReactElement } from "react";
import { getOnChange, getOptions } from "../features/referenceFilter";
import { FilterProps } from "../utils/types";
import { DatagridDropdownFilterContainerProps } from "../../typings/DatagridDropdownFilterProps";
import { ErrorBox } from "./ErrorBox";
import { FilterComponent } from "./FilterComponent";
import { useDropdownId } from "../hooks/useDropdownId";

function StatusNoFilterable(): JSX.Element {
    return <div className="form-control text-normal disabled">Not filterable</div>;
}

interface DropdownFooterProps {
    loading: boolean;
}

function DropdownFooter(props: DropdownFooterProps): JSX.Element | null {
    const { loading } = props;

    if (!loading) {
        return null;
    }

    return (
        <div className="dropdown-footer dropdown-content-section">
            <div className="dropdown-footer-item">
                <div className="dropdown-loading">Loading...</div>
            </div>
        </div>
    );
}

interface DropdownProps {
    dispatch: DispatchFilterUpdate;
    widgetProps: DatagridDropdownFilterContainerProps;
    associationProps: AssociationProperties;
}
function Dropdown({ dispatch, widgetProps, associationProps }: DropdownProps): ReactElement {
    const { association, optionsSource, getOptionLabel } = associationProps;

    const id = useDropdownId();

    const filterable = association.filterable;

    const [getItems, loadMore, lazyList] = useLazyListValue(optionsSource);

    const items = filterable ? lazyList.items : [];

    const [options, objectMap] = getOptions(items, getOptionLabel);

    const onChange = getOnChange(dispatch, association, objectMap);

    const onContentScroll = useOnScrollBottom(loadMore, {
        triggerZoneHeight: 100
    });

    return (
        <FilterComponent
            id={id}
            updateFilters={onChange}
            options={options}
            ariaLabel={widgetProps.ariaLabel?.value}
            className={widgetProps.class}
            emptyOptionCaption={widgetProps.emptyOptionCaption?.value}
            multiSelect={widgetProps.multiSelect}
            styles={widgetProps.style}
            tabIndex={widgetProps.tabIndex}
            status={filterable ? undefined : <StatusNoFilterable />}
            footer={<DropdownFooter loading={lazyList.isLoading} />}
            onTriggerClick={getItems}
            onContentScroll={lazyList.hasMore ? onContentScroll : undefined}
        />
    );
}

export function AssociationFilter({ context, widgetProps }: FilterProps): ReactElement {
    const associationProps = getFilterAssociationProps(context);

    if (associationProps.hasError) {
        return <ErrorBox error={associationProps.error} />;
    }

    return (
        <Dropdown
            widgetProps={widgetProps}
            associationProps={associationProps.value}
            dispatch={context.filterDispatcher}
        />
    );
}
