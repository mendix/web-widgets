import { createElement, Dispatch, memo, ReactElement, useCallback } from "react";
import {
    readReferenceProperties,
    ReferenceProperties,
    useFilterContextValue,
    FilterFunction
} from "@mendix/pluggable-widgets-commons/dist/components/web";
import {
    referenceEqualsCondition,
    referenceSetContainsCondition
} from "@mendix/pluggable-widgets-commons/dist/builders/ConditionUtils";
import { DatagridDropdownFilterContainerProps } from "typings/DatagridDropdownFilterProps";
import { ObjectSelector } from "./ObjectSelector";
import { ObjectItem } from "mendix";
import { useDropdownId } from "src/hooks/useDropdownId";

interface ReferenceFilterProps extends DatagridDropdownFilterContainerProps {
    filterDispatch: Dispatch<FilterFunction>;
    referenceProps: ReferenceProperties;
}

// eslint-disable-next-line prefer-arrow-callback
const ReferenceFilter = memo(function ReferenceFilter(props: ReferenceFilterProps): ReactElement {
    const id = useDropdownId();
    const { referenceProps, filterDispatch } = props;

    const onChange = useCallback(
        (values: ObjectItem[]) => {
            console.log("onChange", values);
            const { referenceToMatch } = referenceProps;
            filterDispatch({
                getFilterCondition() {
                    if (values.length < 1) {
                        return undefined;
                    }
                    if (referenceToMatch.type === "Reference") {
                        return referenceEqualsCondition(referenceToMatch, values[0]);
                    }
                    return referenceSetContainsCondition(referenceToMatch, values);
                }
            });
        },
        [filterDispatch, referenceProps]
    );

    return (
        <ObjectSelector
            id={id}
            onChange={onChange}
            optionsDatasource={referenceProps.referenceOptionsSource}
            optionAttribute={referenceProps.referenceAttribute}
            ariaLabel={props.ariaLabel?.value}
            className={props.class}
            emptyOptionCaption={props.emptyOptionCaption?.value}
            multiSelect={props.multiSelect}
            styles={props.style}
            tabIndex={props.tabIndex}
        />
    );
});

function ReferenceFilterGuard(props: DatagridDropdownFilterContainerProps): ReactElement {
    const contextReadResult = useFilterContextValue();

    if (contextReadResult.hasError) {
        return <div>Out of context</div>;
    }

    const referencePropsReadResult = readReferenceProperties(contextReadResult.value);

    if (referencePropsReadResult.hasError) {
        return <div>We gotta error</div>;
    }

    const { referenceToMatch } = referencePropsReadResult.value;

    if (!referenceToMatch.filterable) {
        return <div>Can&apos;t filter on current association</div>;
    }

    return (
        <ReferenceFilter
            referenceProps={referencePropsReadResult.value}
            filterDispatch={contextReadResult.value.filterDispatcher}
            {...props}
        />
    );
}

export { ReferenceFilterGuard as ReferenceFilter };
