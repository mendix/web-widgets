import { generateUUID, useReferenceProperties } from "@mendix/pluggable-widgets-commons/dist/components/web";
import {
    ListAttributeValue,
    ListReferenceSetValue,
    ListReferenceValue,
    ListValue,
    ValueStatus,
    ObjectItem,
    Option
} from "mendix";
import { createElement, memo, ReactElement, useMemo, useRef } from "react";
import { DatagridDropdownFilterContainerProps } from "typings/DatagridDropdownFilterProps";
import { FilterComponent, FilterOption } from "./FilterComponent";

interface DropdownProps {
    reference: ListReferenceValue | ListReferenceSetValue;
    optionsDatasource: ListValue;
    optionAttribute: ListAttributeValue;
}

function useOptions(list: ListValue, attribute: ListAttributeValue): FilterOption[] {
    return useMemo(() => {
        console.log("[dropdown], useOptions > useMemo");
        if (list.status === ValueStatus.Unavailable) {
            return [];
        }

        const items = list?.items ?? [];

        const getCaption = <T,>(valueObj: { displayValue?: string; value: Option<T> }): string => {
            const value = valueObj.displayValue ?? valueObj.value ?? "Attribute value is unavailable";
            return value.toString();
        };

        const objectToOption = (obj: ObjectItem): FilterOption => ({
            value: obj.id,
            caption: getCaption(attribute.get(obj))
        });

        return items.map(objectToOption);
    }, [list, attribute]);
}

// eslint-disable-next-line prefer-arrow-callback
const Dropdown = memo(function Dropdown(props: DropdownProps): ReactElement {
    const id = useRef(`DropdownFilter${generateUUID()}`);

    console.log("[dropdown] Dropdown render", id, props.optionsDatasource.status);
    const options = useOptions(props.optionsDatasource, props.optionAttribute);
    console.log("[dropdown]", options);

    return <FilterComponent options={options} />;
});

interface ReferenceFilterProps extends DatagridDropdownFilterContainerProps {}

export function ReferenceFilter(_props: ReferenceFilterProps): ReactElement {
    const referenceProps = useReferenceProperties();

    console.log("ReferenceFilter render");

    if (!referenceProps.success) {
        return <div>We gotta error</div>;
    }

    const { referenceToMatch, referenceOptionsSource, referenceAttribute } = referenceProps.value;

    if (!referenceToMatch.filterable) {
        return <div>Can&apos;t filter on current association</div>;
    }

    return (
        <Dropdown
            reference={referenceToMatch}
            optionsDatasource={referenceOptionsSource}
            optionAttribute={referenceAttribute}
        />
    );
}
