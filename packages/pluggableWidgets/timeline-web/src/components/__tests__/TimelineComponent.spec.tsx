import { fireEvent, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createElement } from "react";
import { actionValue } from "@mendix/widget-plugin-test-utils";
import TimelineComponent from "../TimelineComponent";
import { BasicItemType, ComponentProps, CustomItemType } from "../../helpers/types";

const firstDate = new Date(Date.UTC(1453, 4, 29));
const secondDate = new Date(Date.UTC(1453, 4, 30));

describe("Timeline", () => {
    const basicData = new Map<string, BasicItemType[]>();
    const customData = new Map<string, CustomItemType[]>();

    const basicItem: BasicItemType = {
        description: "Basic description",
        eventDateTime: "Basic event Time",
        title: "Basic title"
    };

    const basicItemWithIcon: BasicItemType = {
        ...basicItem,
        icon: { type: "image", iconUrl: "iconUrl" }
    };

    const customItem: CustomItemType = {
        groupHeader: <p>Day Divider</p>,
        title: <p>Title</p>,
        eventDateTime: <p>Date Time</p>,
        description: <p>Description</p>
    };

    const customItemWithIcon: CustomItemType = {
        ...customItem,
        icon: <img src="customIcon" />
    };

    basicData.set(firstDate.toDateString(), [basicItem, basicItemWithIcon]);
    customData.set(secondDate.toDateString(), [customItem, customItemWithIcon]);

    const basicRenderProps: ComponentProps = {
        data: basicData,
        customVisualization: false,
        groupEvents: true,
        ungroupedEventsPosition: "end"
    };
    const customRenderProps: ComponentProps = {
        data: customData,
        customVisualization: true,
        groupEvents: true,
        ungroupedEventsPosition: "end"
    };

    it("renders timeline with basic configuration", () => {
        const { container } = render(<TimelineComponent {...basicRenderProps} />);
        expect(container).toMatchSnapshot();
    });
    it("renders timeline with custom configuration", () => {
        const { container } = render(<TimelineComponent {...customRenderProps} />);
        expect(container).toMatchSnapshot();
    });
    it("hides the timeline header", () => {
        const { container } = render(<TimelineComponent {...basicRenderProps} groupEvents={false} />);
        expect(container).toMatchSnapshot();
    });

    describe("with action set", () => {
        it("renders with clickable styles", () => {
            const action = actionValue(true, false);
            const basicItemWithAction: BasicItemType = {
                ...basicItem,
                icon: { type: "image", iconUrl: "iconUrl" },
                action
            };
            basicData.set(secondDate.toDateString(), [basicItemWithAction]);

            const basicPropsWithAction = { ...basicRenderProps, data: basicData };
            const { container } = render(<TimelineComponent {...basicPropsWithAction} />);
            const clickableItem = container.querySelector(".clickable");
            expect(clickableItem).toBeInTheDocument();
            expect(container).toMatchSnapshot();
        });
        it("triggers actions when clicked", () => {
            const action = actionValue(true, false);
            const basicItemWithAction: BasicItemType = {
                ...basicItem,
                icon: { type: "image", iconUrl: "iconUrl" },
                action
            };
            basicData.set(secondDate.toDateString(), [basicItemWithAction]);

            const basicPropsWithAction = { ...basicRenderProps, data: basicData };
            const { container } = render(<TimelineComponent {...basicPropsWithAction} />);
            const clickableItem = container.querySelector(".clickable");
            fireEvent.click(clickableItem!);
            expect(action.execute).toHaveBeenCalled();
        });
        it("change style when hovered", () => {
            const action = actionValue(true, false);
            const basicItemWithAction: BasicItemType = {
                ...basicItem,
                icon: { type: "image", iconUrl: "iconUrl" },
                action
            };
            basicData.set(secondDate.toDateString(), [basicItemWithAction]);

            const basicPropsWithAction = { ...basicRenderProps, data: basicData };
            const { container } = render(<TimelineComponent {...basicPropsWithAction} />);
            const clickableItem = container.querySelector(".clickable");
            fireEvent.mouseOver(clickableItem!);
            expect(container).toMatchSnapshot();
        });
    });
});
