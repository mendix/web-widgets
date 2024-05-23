import { parseStyle } from "@mendix/widget-plugin-platform/preview/parse-style";
import { DynamicValue } from "mendix";
import {
    DatagridDateFilterContainerProps,
    DatagridDateFilterPreviewProps
} from "../../typings/DatagridDateFilterProps";

export function isLoadingDefaultValues(props: DatagridDateFilterContainerProps): boolean {
    const statusList = [props.defaultValue?.status, props.defaultStartDate?.status, props.defaultEndDate?.status];
    return statusList.some(status => status === "loading");
}

type UnknownProps = DatagridDateFilterContainerProps | DatagridDateFilterPreviewProps;

export function isPreviewProps(props: UnknownProps): props is DatagridDateFilterPreviewProps {
    let isPreview = typeof props.style === "string";
    isPreview ||= typeof props.defaultValue === "string";
    isPreview ||= typeof props.valueAttribute === "string";
    return isPreview;
}

export function normalizeProps(props: UnknownProps): DatagridDateFilterContainerProps {
    const wrap = (v: string): DynamicValue<string> => ({ value: v, status: "available" } as DynamicValue<string>);

    if (isPreviewProps(props)) {
        return {
            name: "DateFilter",
            class: props.class,
            style: parseStyle(props.style),
            tabIndex: undefined,
            advanced: props.advanced,
            defaultValue: undefined,
            defaultStartDate: undefined,
            defaultEndDate: undefined,
            defaultFilter: props.defaultFilter,
            placeholder: wrap(props.placeholder),
            adjustable: props.adjustable,
            valueAttribute: undefined,
            startDateAttribute: undefined,
            endDateAttribute: undefined,
            onChange: undefined,
            screenReaderButtonCaption: wrap(props.screenReaderButtonCaption),
            screenReaderCalendarCaption: wrap(props.screenReaderCalendarCaption),
            screenReaderInputCaption: wrap(props.screenReaderInputCaption)
        };
    }

    return props;
}
