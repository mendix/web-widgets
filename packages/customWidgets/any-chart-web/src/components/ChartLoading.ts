import { ReactElement, FunctionComponent, createElement } from "react";
import "../ui/ChartsLoading.scss";

export const ChartLoading: FunctionComponent = () =>
    createElement(
        "div",
        { className: "widget-charts-loading-wrapper" },
        createElement("div", { className: "widget-charts-loading-indicator" }, ...generateDivs(12))
    );

export const generateDivs = (amount: number) => {
    const divs: ReactElement<any>[] = [];
    for (let i = 0; i < amount; i++) {
        divs.push(createElement("div"));
    }

    return divs;
};

ChartLoading.displayName = "ChartLoading";
