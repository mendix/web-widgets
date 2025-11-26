import classNames from "classnames";
import ReactDatePicker from "react-datepicker";
import { DateTimePickerContainerProps } from "typings/DateTimePickerProps";
import { useController } from "../hooks/useController";
import { useSetupProps } from "../hooks/useSetupProps";

export function DateTimePickerContainer(props: DateTimePickerContainerProps) {
    const controller = useController({
        endDate: props.endDateAttribute?.status === "available" ? (props.endDateAttribute.value as Date) : undefined,
        startDate: props.dateAttribute.status === "available" ? (props.dateAttribute.value as Date) : undefined,
        type: props.type,
        onChange: props.onChange
    });
    const pickerProps = useSetupProps(props, controller);
    const label = props.showLabel && props.label?.status === "available" ? props.label.value : null;
    const portalId = `datepicker_` + Math.random();

    // still have to add validation for max and min time and validation message
    console.info("unused props", {
        name: props.name,
        editabilityCondition: props.editabilityCondition,
        readOnlyStyle: props.readOnlyStyle,
        visible: props.visible,
        validationType: props.validationType,
        customValidation: props.customValidation,
        validationMessage: props.validationMessage
    });

    const hasValidationMessage =
        props.validationMessage?.status === "available" && props.validationMessage.value.length > 0;

    return (
        <div
            className={classNames("widget-datetimepicker", props.class)}
            data-focusindex={props.tabIndex}
            style={props.style}
        >
            {label ? (
                <div className="widget-datetimepicker-label-wrapper">
                    <div id={portalId} />

                    <label className="widget-datetimepicker-label" id={pickerProps.ariaLabelledBy}>
                        {label}
                    </label>
                </div>
            ) : (
                <span className="sr-only" id={pickerProps.ariaLabelledBy}>
                    Date picker
                </span>
            )}

            <div className="widget-datetimepicker-wrapper">
                <ReactDatePicker {...pickerProps} ref={controller.pickerRef} />

                <button
                    aria-controls={portalId}
                    aria-expanded={controller.expanded}
                    aria-haspopup
                    aria-label="Show calendar"
                    className="widget-datetimepicker-input-button"
                    onKeyDown={controller.handleButtonKeyDown}
                    onMouseDown={controller.handleButtonMouseDown}
                    type="button"
                >
                    <span className="mx-icon-filled mx-icon-calendar" />
                </button>
                {hasValidationMessage && <div role="alert">{props.validationMessage?.value}</div>}
            </div>
        </div>
    );
}
