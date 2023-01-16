import {
    ConditionDispatch,
    AssociationProperties,
    getFilterAssociationProps
} from "@mendix/pluggable-widgets-commons/dist/components/web";
import { useLazyListValue } from "@mendix/pluggable-widgets-commons/dist/hooks/useLazyListValue";
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
    hasMore: boolean;
    onLoadMore?: () => void;
}

function DropdownFooter(props: DropdownFooterProps): JSX.Element | null {
    const { loading, hasMore, onLoadMore } = props;

    if (!loading && !hasMore) {
        return null;
    }

    return (
        <div className="dropdown-footer dropdown-content-section">
            <div className="dropdown-footer-item">
                {loading ? (
                    <div className="dropdown-loading">Loading...</div>
                ) : (
                    <button className="btn btn-block btn-sm" onClick={onLoadMore}>
                        Load more
                    </button>
                )}
            </div>
        </div>
    );
}

interface DropdownProps {
    dispatch: ConditionDispatch;
    widgetProps: DatagridDropdownFilterContainerProps;
    associationProps: AssociationProperties;
}
function Dropdown({ dispatch, widgetProps, associationProps }: DropdownProps): ReactElement {
    const { association, optionsSource, getOptionLabel } = associationProps;
    const id = useDropdownId();

    const filterable = association.filterable;

    const [getItems, loadMore, lazyList] = useLazyListValue(optionsSource, widgetProps.optionsPageSize);

    const items = filterable ? lazyList.items : [];

    const [options, objectMap] = getOptions(items, getOptionLabel);

    const onChange = getOnChange(dispatch, association, objectMap);

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
            footer={
                <DropdownFooter
                    loading={lazyList.isLoading}
                    hasMore={lazyList.isFetched && lazyList.hasMore}
                    onLoadMore={loadMore}
                />
            }
            onTriggerClick={getItems}
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
