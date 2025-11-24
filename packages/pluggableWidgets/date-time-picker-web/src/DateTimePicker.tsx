import { ReactElement } from "react";
import { DateTimePickerContainerProps } from "../typings/DateTimePickerProps";
import { DateTimePickerContainer } from "./components/DateTimePickerContainer";

import "react-datepicker/dist/react-datepicker.css";
import "./ui/DateTimePicker.scss";

export function DateTimePicker(props: DateTimePickerContainerProps): ReactElement {
    return <DateTimePickerContainer {...props} />;
}
