import { shallow } from "enzyme";
import { createElement } from "react";
import { PlaygroundInfo } from "../components/PlaygroundInfo";
import { Alert } from "../components/Alert";

describe("PlaygroundInfo", () => {
    it("should render the structure correctly", () => {
        const info = shallow(createElement(PlaygroundInfo));

        expect(info).toBeElement(
            createElement(
                Alert,
                { bootstrapStyle: "info" },
                createElement(
                    "p",
                    {},
                    createElement("strong", {}, "  Changes made in this editor are only for preview purposes.")
                ),
                createElement(
                    "p",
                    {},
                    "The JSON can be copied and pasted into the widgets properties in the desktop modeler"
                ),
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
            )
        );
    });
});
