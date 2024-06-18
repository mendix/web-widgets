import { shallow } from "enzyme";
import { createElement } from "react";
import { actionValue } from "@mendix/widget-plugin-test-utils";
import TimelineComponent from "../TimelineComponent";
import { BasicItemType, CustomItemType, ComponentProps } from "../../helpers/types";

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
        const component = shallow(<TimelineComponent {...basicRenderProps} />);
        expect(component).toMatchSnapshot();
    });
    it("renders timeline with custom configuration ", () => {
        const component = shallow(<TimelineComponent {...customRenderProps} />);
        expect(component).toMatchSnapshot();
    });
    it("hides the timeline header", () => {
        const component = shallow(<TimelineComponent {...basicRenderProps} groupEvents={false} />);
        expect(component).toMatchSnapshot();
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
            const component = shallow(<TimelineComponent {...basicPropsWithAction} />);

            const clickableItem = component.find(".clickable");

            expect(clickableItem).toHaveLength(1);
            expect(component).toMatchSnapshot();
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
            const component = shallow(<TimelineComponent {...basicPropsWithAction} />);

            const clickableItem = component.find(".clickable");
            clickableItem.simulate("click");

            expect(action.execute).toBeCalled();
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
            const component = shallow(<TimelineComponent {...basicPropsWithAction} />);

            const clickableItem = component.find(".clickable");
            clickableItem.simulate("mouseover");

            expect(component).toMatchSnapshot();
        });
    });
});
