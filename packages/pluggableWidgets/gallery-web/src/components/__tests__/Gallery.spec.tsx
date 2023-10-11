import { createElement } from "react";
import { mount, render, shallow } from "enzyme";
import { Widget, WidgetProps } from "../Widget";
import { ObjectItem } from "mendix";
import { WidgetItemBuilder } from "../../utils/test-utils";
import { listAction, objectItems } from "@mendix/widget-plugin-test-utils";
import { ListOptionSelectionProps } from "@mendix/widget-plugin-grid/selection/useListOptionSelectionProps";

function mockSelectionProps(): ListOptionSelectionProps {
    return {
        isSelected: jest.fn(() => false),
        onSelect: jest.fn(),
        onSelectAll: jest.fn(),
        onKeyDown: jest.fn(),
        onKeyUp: jest.fn(),
        selectionType: "None",
        multiselectable: undefined
    };
}

function mockItemHelperWithAction(onClick: () => void) {
    return WidgetItemBuilder.sample(b =>
        b.withAction(
            listAction(mockAction => {
                const action = mockAction();
                action.execute = onClick;
                return action;
            })
        )
    );
}

function mockProps(): WidgetProps<ObjectItem> {
    return {
        hasMoreItems: false,
        page: 0,
        pageSize: 10,
        paging: false,
        phoneItems: 2,
        tabletItems: 3,
        desktopItems: 4,
        className: "my-gallery",
        items: objectItems(3),
        itemHelper: WidgetItemBuilder.sample(),
        selectionProps: mockSelectionProps(),
        showHeader: true,
        header: <input />
    };
}

describe("Gallery", () => {
    describe("DOM Structure", () => {
        it("renders correctly", () => {
            const gallery = render(<Widget {...mockProps()} />);

            expect(gallery).toMatchSnapshot();
        });

        it("renders correctly with onclick event", () => {
            const gallery = render(<Widget {...mockProps()} itemHelper={mockItemHelperWithAction(jest.fn())} />);

            expect(gallery).toMatchSnapshot();
        });
    });

    describe("with events", () => {
        it("triggers correct events on click", () => {
            const onClick = jest.fn();
            const itemHelper = mockItemHelperWithAction(onClick);
            const gallery = mount(<Widget {...mockProps()} itemHelper={itemHelper} />);
            const galleryFirstItem = gallery.find("[role=button]").at(0);

            expect(galleryFirstItem).toBeDefined();

            galleryFirstItem.simulate("click");

            expect(onClick).toBeCalled();
        });

        it("triggers correct events on Enter key down", () => {
            const onClick = jest.fn();
            const gallery = mount(<Widget {...mockProps()} />);
            const galleryFirstItem = gallery.find(".widget-gallery-clickable").at(0);

            expect(galleryFirstItem).toBeDefined();

            galleryFirstItem.simulate("keydown", { key: "Enter" });

            expect(onClick).toBeCalled();
        });

        it("triggers correct events on Space key down", () => {
            const onClick = jest.fn();
            const gallery = mount(<Widget {...mockProps()} />);
            const galleryFirstItem = gallery.find(".widget-gallery-clickable").at(0);

            expect(galleryFirstItem).toBeDefined();

            galleryFirstItem.simulate("keydown", { key: " " });

            expect(onClick).toBeCalled();
        });
    });

    describe("with different configurations per platform", () => {
        it("contains correct classes for desktop", () => {
            const gallery = shallow(<Widget {...mockProps()} desktopItems={12} />);

            expect(gallery.find(".widget-gallery-items").hasClass("widget-gallery-lg-12")).toBeTruthy();
        });

        it("contains correct classes for tablet", () => {
            const gallery = shallow(<Widget {...mockProps()} tabletItems={6} />);

            expect(gallery.find(".widget-gallery-items").hasClass("widget-gallery-md-6")).toBeTruthy();
        });

        it("contains correct classes for phone", () => {
            const gallery = shallow(<Widget {...mockProps()} phoneItems={3} />);

            expect(gallery.find(".widget-gallery-items").hasClass("widget-gallery-sm-3")).toBeTruthy();
        });
    });

    describe("with custom classes", () => {
        it("contains correct classes in the wrapper", () => {
            const gallery = shallow(<Widget {...mockProps()} className="custom-class" />);

            expect(gallery.hasClass("custom-class")).toBeTruthy();
        });

        it("contains correct classes in the items", () => {
            const gallery = shallow(<Widget {...mockProps()} />);
            const galleryFirstItem = gallery.find(".widget-gallery-item").at(0);

            expect(galleryFirstItem.hasClass("custom-class")).toBeTruthy();
        });
    });

    describe("with pagination", () => {
        it("renders correctly", () => {
            const gallery = render(
                <Widget {...mockProps()} paging paginationPosition="above" numberOfItems={20} hasMoreItems />
            );

            expect(gallery).toMatchSnapshot();
        });

        it("triggers correct events on click next button", () => {
            const setPage = jest.fn();
            const gallery = mount(
                <Widget
                    {...mockProps()}
                    paging
                    paginationPosition="above"
                    numberOfItems={20}
                    hasMoreItems
                    setPage={setPage}
                />
            );
            const galleryFirstItem = gallery.find(".step-forward").at(0);

            expect(galleryFirstItem).toBeDefined();

            galleryFirstItem.simulate("click");

            expect(setPage).toBeCalled();
        });
    });

    describe("with empty option", () => {
        it("renders correctly", () => {
            const gallery = render(
                <Widget
                    {...mockProps()}
                    items={[]}
                    emptyPlaceholderRenderer={renderWrapper => renderWrapper(<span>No items found</span>)}
                />
            );

            expect(gallery).toMatchSnapshot();
        });
    });

    describe("with accessibility properties", () => {
        it("renders correctly", () => {
            const gallery = render(
                <Widget
                    {...mockProps()}
                    items={[]}
                    headerTitle="filter title"
                    emptyMessageTitle="empty message"
                    emptyPlaceholderRenderer={renderWrapper => renderWrapper(<span>No items found</span>)}
                />
            );

            expect(gallery).toMatchSnapshot();
        });
    });

    describe("without filters", () => {
        it("renders structure without header container", () => {
            const filters = { ...mockProps(), showHeader: false, header: undefined };
            const gallery = render(<Widget {...filters} />);

            expect(gallery).toMatchSnapshot();
        });
    });
});
