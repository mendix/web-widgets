import { FunctionComponent, createElement } from "react";
import { Alert } from "./Alert";

export const PlaygroundInfo: FunctionComponent = () =>
    createElement(
        Alert,
        { bootstrapStyle: "info" },
        createElement(
            "p",
            {},
            createElement("strong", {}, "  Changes made in this editor are only for preview purposes.")
        ),
        createElement("p", {}, "The JSON can be copied and pasted into the widgets properties in the desktop modeler"),
        createElement(
            "p",
            {},
            "Check out the chart options here: ",
            createElement(
                "a",
                { href: "https://plot.ly/javascript/reference/", target: "_BLANK" },
                "https://plot.ly/javascript/reference/"
            )
        )
    );
