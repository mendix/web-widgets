import { ReactElement, createElement, useCallback } from "react";

import { DateTimePickerContainerProps } from "../typings/DateTimePickerProps";
import { BadgeSample } from "./components/BadgeSample";
import "./ui/DateTimePicker.css";

export function DateTimePicker(props: DateTimePickerContainerProps): ReactElement {
    const { datetimepickerType, datetimepickerValue, valueAttribute, onClickAction, style, bootstrapStyle } = props;
    const onClickHandler = useCallback(() => {
        if (onClickAction && onClickAction.canExecute) {
            onClickAction.execute();
        }
    }, [onClickAction]);

    return (
        <BadgeSample
            type={datetimepickerType}
            bootstrapStyle={bootstrapStyle}
            className={props.class}
            clickable={!!onClickAction}
            defaultValue={datetimepickerValue ? datetimepickerValue : ""}
            onClickAction={onClickHandler}
            style={style}
            value={valueAttribute ? valueAttribute.displayValue : ""}
        />
    );
}
