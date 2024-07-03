import { createElement, ReactNode } from "react";
import { SliderContainerProps } from "../typings/SliderProps";
import "./ui/Slider.scss";
import { Container } from "./components/Container";

export default function Slider(props: SliderContainerProps): ReactNode {
    // const {
    //     valueAttribute,
    //     orientation,
    //     heightUnit,
    //     height,
    //     minValueType,
    //     minAttribute,
    //     expressionMinimumValue,
    //     staticMinimumValue,
    //     stepSizeType,
    //     stepValue,
    //     stepAttribute,
    //     expressionStepSize,
    //     maxValueType,
    //     staticMaximumValue,
    //     maxAttribute,
    //     expressionMaximumValue,
    //     noOfMarkers,
    //     decimalPlaces,
    //     tooltip,
    //     showTooltip,
    //     tooltipType,
    //     tooltipAlwaysVisible,
    //     onChange: onChangeProp
    // } = props;
    // const minValue = getMinValue({
    //     minValueType,
    //     staticMinimumValue,
    //     minAttribute,
    //     expressionMinimumValue
    // });
    // const maxValue = getMaxValue({
    //     maxValueType,
    //     staticMaximumValue,
    //     maxAttribute,
    //     expressionMaximumValue
    // });
    // const step = getStepValue({
    //     stepSizeType,
    //     stepValue,
    //     stepAttribute,
    //     expressionStepSize
    // });
    // const marks = useMarks({
    //     noOfMarkers,
    //     decimalPlaces,
    //     minValueType,
    //     staticMinimumValue,
    //     minAttribute,
    //     expressionMinimumValue,
    //     maxValueType,
    //     staticMaximumValue,
    //     maxAttribute,
    //     expressionMaximumValue
    // });
    // const sliderRef = useRef<HTMLDivElement>(null);
    // const handle = createHandleGenerator({ tooltip, showTooltip, tooltipType, tooltipAlwaysVisible, sliderRef });
    // const { onChange } = useOnChangeDebounced({ valueAttribute, onChange: onChangeProp });
    // const style = getStyleProp({ orientation, height, heightUnit });
    // useScheduleUpdateOnce(() => valueAttribute.status === ValueStatus.Available);

    // return (
    //     <SliderComponent
    //         disabled={valueAttribute.readOnly}
    //         rootStyle={style}
    //         vertical={isVertical(props)}
    //         value={valueAttribute.value?.toNumber()}
    //         min={minValue}
    //         max={maxValue}
    //         step={step}
    //         onChange={onChange}
    //         marks={marks}
    //         handle={handle}
    //         ref={sliderRef}
    //     />
    // );

    return <Container {...props} />;
}
