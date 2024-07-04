import { ReactNode, createElement } from "react";
import { RangeSliderContainerProps } from "../typings/RangeSliderProps";
import "rc-slider/assets/index.css";
import "rc-tooltip/assets/bootstrap.css";
import "./ui/RangeSlider.scss";
import { Container } from "./components/Container";

export function RangeSlider(props: RangeSliderContainerProps): ReactNode {
    return <Container {...props} />;
}
