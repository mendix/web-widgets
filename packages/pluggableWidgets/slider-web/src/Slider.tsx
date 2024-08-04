import { createElement, ReactNode } from "react";
import { SliderContainerProps } from "../typings/SliderProps";
import "./ui/Slider.scss";
import { Container } from "./components/Container";

export default function Slider(props: SliderContainerProps): ReactNode {
    return <Container {...props} />;
}
