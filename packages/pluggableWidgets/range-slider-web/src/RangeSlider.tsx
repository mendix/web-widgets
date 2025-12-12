import { ReactNode } from "react";
import { RangeSliderContainerProps } from "../typings/RangeSliderProps";
import "@rc-component/slider/assets/index.css";
import "@rc-component/tooltip/assets/bootstrap.css";
import "./ui/RangeSlider.scss";
import { Container } from "./components/Container";

export function RangeSlider(props: RangeSliderContainerProps): ReactNode {
    return <Container {...props} />;
}
