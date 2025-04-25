import React, { createElement } from "react";
import { render } from "@testing-library/react";
import { create } from "react-test-renderer";
import { ListValueBuilder } from "@mendix/widget-plugin-test-utils";

import Calendar from "../Calendar";
import { CalendarContainerProps } from "../../typings/CalendarProps";

const createDefaultProps = (): CalendarContainerProps => ({
    name: "calendar-test",
    class: "calendar-class",
    tabIndex: 0,
    databaseDataSource: new ListValueBuilder().withItems([]).build(),
    titleType: "attribute",
    view: "standard",
    defaultView: "month",
    editable: "default",
    enableCreate: true,
    widthUnit: "percentage",
    width: 100,
    heightUnit: "pixels",
    height: 400,
    minHeightUnit: "pixels",
    minHeight: 400,
    maxHeightUnit: "none",
    maxHeight: 400,
    overflowY: "auto"
});

describe("Calendar", () => {
    it("renders correctly with basic props", () => {
        const props = createDefaultProps();
        const calendar = create(<Calendar {...props} />).toJSON();
        expect(calendar).toMatchSnapshot();
    });

    it("renders with correct class name", () => {
        const props = createDefaultProps();
        const { container } = render(<Calendar {...props} />);
        expect(container.querySelector(".widget-calendar")).toBeTruthy();
        expect(container.querySelector(".calendar-class")).toBeTruthy();
    });
});
