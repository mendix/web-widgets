import { ComponentType, CSSProperties, ReactElement, ReactNode } from "react";

export interface ChartPreviewProps {
    class: string;
    showLegend: boolean;
    widthUnit: "percentage" | "pixels";
    width: number | null;
    heightUnit: "percentageOfWidth" | "pixels" | "percentageOfParent";
    height: number | null;
    playground: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    showPlaygroundSlot?: boolean;
    image: ReactNode;
    legend: ReactNode;
}

export function ChartPreview(props: ChartPreviewProps): ReactElement {
    const { renderer: PlaygroundSlot } = props.playground ?? { renderer: () => null };
    return (
        <div style={{ display: "flex", flexFlow: "column nowrap", maxWidth: "100%", maxHeight: "100%" }}>
            <div
                style={
                    props.showPlaygroundSlot
                        ? undefined
                        : {
                              display: "none"
                          }
                }
            >
                <PlaygroundSlot caption="Playground slot">{dropzone()}</PlaygroundSlot>
            </div>
            <Chart {...props} />
        </div>
    );
}

ChartPreview.PlotImage = (props: { src: string; alt: string }) => {
    return (
        <img
            src={props.src}
            alt={props.alt}
            style={{ objectFit: "contain", flex: "1 1 0", minWidth: 0, minHeight: 0, height: "100%" }}
        />
    );
};

ChartPreview.PlotLegend = (props: { src: string; alt: string }) => {
    return <img src={props.src} alt={props.alt} style={{ flex: "0 1 85px", minWidth: 0, maxWidth: "85px" }} />;
};

// Mirrors the runtime dimensions, but never lets the preview grow past its parent.
function getPreviewDimensions(props: ChartPreviewProps): CSSProperties {
    const style: CSSProperties = { boxSizing: "border-box", maxWidth: "100%", maxHeight: "100%" };

    if (props.width) {
        style.width = props.widthUnit === "percentage" ? `${props.width}%` : `${props.width}px`;
    }

    if (props.height) {
        if (props.heightUnit === "percentageOfWidth") {
            style.aspectRatio = `100 / ${props.height}`;
        } else if (props.heightUnit === "pixels") {
            style.height = `${props.height}px`;
        } else {
            style.height = `${props.height}%`;
        }
    }

    return style;
}

function Chart(props: ChartPreviewProps): ReactElement {
    return (
        <div className={props.class} style={{ display: "flex", overflow: "hidden", ...getPreviewDimensions(props) }}>
            {props.image}
            {props.showLegend ? props.legend : null}
        </div>
    );
}

// Preview don't support React component as children. So we forced to use plain function.
const dropzone = (): ReactNode => (
    <div style={{ padding: "10px 10px 10px 0", display: "flex", justifyContent: "end", flexGrow: 1, height: 58 }} />
);
