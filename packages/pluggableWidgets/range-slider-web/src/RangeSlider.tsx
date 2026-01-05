import { ReactNode } from "react";
import { RangeSliderContainerProps } from "../typings/RangeSliderProps";
import "./ui/RangeSlider.scss";
import { Container } from "./components/Container";

export function RangeSlider(props: RangeSliderContainerProps): ReactNode {
    return <Container {...props} />;
}
