import { Fragment, ReactNode } from "react";
import { SliderContainerProps } from "../typings/SliderProps";
import { ValidationAlert } from "@mendix/widget-plugin-component-kit/Alert";
import "./ui/Slider.scss";
import { Container } from "./components/Container";

export default function Slider(props: SliderContainerProps): ReactNode {
    return (
        <Fragment>
            <Container {...props} />
            <ValidationAlert>{props.valueAttribute.validation}</ValidationAlert>
        </Fragment>
    );
}
