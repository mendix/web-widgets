import { ReactElement } from "react";
import { DateTimePickerPreviewProps } from "../typings/DateTimePickerProps";
import "./ui/DateTimePicker.scss";

export function preview(props: DateTimePickerPreviewProps): ReactElement {
    return (
        <div className="widget-datetimepicker">
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
    );
}
