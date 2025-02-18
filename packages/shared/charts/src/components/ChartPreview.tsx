import { ComponentType, ReactNode, createElement } from "react";

export interface ChartPreviewProps {
    class: string;
    showLegend: boolean;
    playground: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    showPlaygroundSlot?: boolean;
    image: React.ReactNode;
    legend: React.ReactNode;
}

export function ChartPreview(props: ChartPreviewProps): React.ReactElement {
    const { renderer: PlaygroundSlot } = props.playground ?? { renderer: () => null };
    return (
        <div style={{ display: "inline-flex", flexFlow: "column nowrap" }}>
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
    return <img src={props.src} alt={props.alt} style={{ objectFit: "contain", width: "300px", height: "100%" }} />;
};

ChartPreview.PlotLegend = (props: { src: string; alt: string }) => {
    return <img src={props.src} alt={props.alt} style={{ width: "85px" }} />;
};

function Chart(props: ChartPreviewProps): React.ReactElement {
    return (
        <div
            className={props.class}
            style={{
                display: "flex",
                width: props.showLegend ? "385px" : "300px",
                height: "232px"
            }}
        >
            {props.image}
            {props.showLegend ? props.legend : null}
        </div>
    );
}

// Preview don't support React component as children. So we forced to use plain function.
const dropzone = (): React.ReactNode => (
    <div style={{ padding: "10px 10px 10px 0", display: "flex", justifyContent: "end", flexGrow: 1, height: 58 }} />
);
