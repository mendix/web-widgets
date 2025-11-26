import { ReactElement } from "react";
import { DateTimePickerPreviewProps } from "../typings/DateTimePickerProps";
import "./ui/DateTimePicker.scss";

export function preview(props: DateTimePickerPreviewProps): ReactElement {
    const label = props.showLabel ? props.label : null;
    const portalId = `datepicker_` + Math.random();

    return (
        <div className="widget-datetimepicker">
            {label ? (
                <div className="widget-datetimepicker-label-wrapper">
                    <div id={portalId} />

                    <label className="widget-datetimepicker-label" id="datepicker-label">
                        {label}
                    </label>
                </div>
            ) : (
                <span className="sr-only" id="datepicker-label">
                    Date picker
                </span>
            )}

            <div className="widget-datetimepicker-wrapper">
                <div className="react-datepicker-wrapper">
                    <div className="react-datepicker__input-container">
                        <input
                            className="widget-datetimepicker-input react-datepicker-ignore-onclickoutside"
                            placeholder={props.placeholder ?? ""}
                            readOnly
                            type="text"
                            value={props.dateAttribute ? `[${props.dateAttribute}]` : "[Date time picker]"}
                        />
                    </div>
                </div>

                <button aria-label="Show calendar" className="widget-datetimepicker-input-button" type="button">
                    <span className="mx-icon-filled mx-icon-calendar" />
                </button>
            </div>
        </div>
    );
}
