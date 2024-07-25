import { ReactElement, createElement, useCallback } from "react";

import { DynamicGridContainerProps } from "../typings/DynamicGridProps";
import { BadgeSample } from "./components/BadgeSample";
import "./ui/DynamicGrid.css";

export function DynamicGrid(props: DynamicGridContainerProps): ReactElement {
    const { dynamicgridType, dynamicgridValue, valueAttribute, onClickAction, style, bootstrapStyle } = props;
    const onClickHandler = useCallback(() => {
        if (onClickAction && onClickAction.canExecute) {
            onClickAction.execute();
        }
    }, [onClickAction]);

    return (
        <BadgeSample
            type={dynamicgridType}
            bootstrapStyle={bootstrapStyle}
            className={props.class}
            clickable={!!onClickAction}
            defaultValue={dynamicgridValue ? dynamicgridValue : ""}
            onClickAction={onClickHandler}
            style={style}
            value={valueAttribute ? valueAttribute.displayValue : ""}
        />
    );
}
