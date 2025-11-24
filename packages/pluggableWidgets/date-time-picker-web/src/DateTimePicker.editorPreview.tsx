import { ReactElement } from "react";
import { DateTimePickerPreviewProps } from "../typings/DateTimePickerProps";
import { DatePicker } from "./components/DatePicker";
import "./ui/DateTimePicker.scss";

export function preview(props: DateTimePickerPreviewProps): ReactElement {
    console.info("Rendering DateTimePicker preview with props:", props);
    return <DatePicker label={props.label} />;
}
