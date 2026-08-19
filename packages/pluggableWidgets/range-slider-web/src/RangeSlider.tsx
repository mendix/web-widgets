import { Fragment, ReactNode } from "react";
import { ValidationAlert } from "@mendix/widget-plugin-component-kit/Alert";
import { RangeSliderContainerProps } from "../typings/RangeSliderProps";
import { Container } from "./components/Container";
import "./ui/RangeSlider.scss";

export function RangeSlider(props: RangeSliderContainerProps): ReactNode {
    return (
        <Fragment>
            <Container {...props} />
            <ValidationAlert>{props.lowerBoundAttribute.validation}</ValidationAlert>
            <ValidationAlert>{props.upperBoundAttribute.validation}</ValidationAlert>
        </Fragment>
    );
}
