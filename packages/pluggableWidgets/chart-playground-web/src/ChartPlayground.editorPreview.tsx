import { ReactElement, createElement } from "react";
import "./ui/Playground.scss";

export function preview(): ReactElement {
    return (
        <div className={"widget-charts-playground"}>
            <div className="widget-charts-playground-toggle">
                <button className="mx-button btn">Toggle Editor</button>
            </div>
        </div>
    );
}

export function getPreviewCss(): string {
    // html element has no styling by design
    return "";
}
