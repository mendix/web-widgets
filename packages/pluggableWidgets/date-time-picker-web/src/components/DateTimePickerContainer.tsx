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
    const portalId = `datepicker_` + Math.random();

    // still have to add validation for max and min time and validation message
    console.info("unused props", {
        name: props.name,
        id: props.id,
        validationType: props.validationType,
        customValidation: props.customValidation,
        validationMessage: props.validationMessage
    });

    const hasValidationMessage =
        props.validationMessage?.status === "available" && props.validationMessage.value.length > 0;

    return (
        <div className="widget-datetimepicker" data-focusindex={props.tabIndex}>
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
    );
}
