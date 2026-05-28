import classNames from "classnames";
import { Dispatch, ReactElement, ReactNode, SetStateAction, useEffect, useRef } from "react";
import { WheelZoomModeEnum } from "../../typings/ImageCropProps";
import { useWheelZoom } from "../hooks/useWheelZoom";

interface ZoomContainerProps {
    mode: WheelZoomModeEnum;
    minZoom: number;
    maxZoom: number;
    setZoom: Dispatch<SetStateAction<number>>;
    boundaryWidth: number;
    boundaryHeight: number;
    circular: boolean;
    children: ReactNode;
}

export function ZoomContainer(props: ZoomContainerProps): ReactElement {
    const containerRef = useRef<HTMLDivElement>(null);
    const onWheel = useWheelZoom({
        mode: props.mode,
        minZoom: props.minZoom,
        maxZoom: props.maxZoom,
        setZoom: props.setZoom
    });

    useEffect(() => {
        const el = containerRef.current;
        if (!el) {
            return;
        }
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, [onWheel]);

    return (
        <div
            ref={containerRef}
            className={classNames("widget-image-crop__canvas", {
                "widget-image-crop__canvas--circle": props.circular
            })}
            style={{ maxWidth: props.boundaryWidth, maxHeight: props.boundaryHeight }}
        >
            {props.children}
        </div>
    );
}
