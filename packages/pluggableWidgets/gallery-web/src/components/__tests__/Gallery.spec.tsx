import { createElement } from "react";
import { mount, render } from "enzyme";
import { Gallery, GalleryProps } from "../../components/Gallery";
import { ObjectItem } from "mendix";
import { WidgetItemBuilder } from "../../utils/test-utils";
import { listAction, listExp, objectItems } from "@mendix/widget-plugin-test-utils";
import { ListOptionSelectionProps } from "@mendix/widget-plugin-grid/selection/useListOptionSelectionProps";
import { ItemHelper } from "../../helpers/ItemHelper";
import "./__mocks__/intersectionObserverMock";

function mockSelectionProps(): ListOptionSelectionProps {
    return {
        isSelected: jest.fn(() => false),
        onSelect: jest.fn(),
        onSelectAll: jest.fn(),
        onSelectAdjacent: jest.fn(),
        onKeyDown: jest.fn(),
        onKeyUp: jest.fn(),
        selectionType: "None"
    };
}

function mockItemHelperWithAction(onClick: () => void): ItemHelper {
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

function mockProps(): GalleryProps<ObjectItem> {
    return {
        hasMoreItems: false,
        page: 0,
        pageSize: 10,
        paging: false,
        phoneItems: 2,
        tabletItems: 3,
        desktopItems: 4,
        className: "my-gallery",
        ariaLabelListBox: "Mock props ListBox aria label",
        headerTitle: "Mock props header aria label",
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
            const gallery = render(<Gallery {...mockProps()} />);

            expect(gallery).toMatchSnapshot();
        });

        it("renders correctly with onclick event", () => {
            const gallery = render(<Gallery {...mockProps()} itemHelper={mockItemHelperWithAction(jest.fn())} />);

            expect(gallery).toMatchSnapshot();
        });
    });

    describe("with events", () => {
        it("triggers correct events on click", () => {
            const onClick = jest.fn();
            const itemHelper = mockItemHelperWithAction(onClick);
            const gallery = mount(<Gallery {...mockProps()} itemHelper={itemHelper} />);
            const galleryFirstItem = gallery.find(".widget-gallery-item-button").at(0);

            expect(galleryFirstItem).toBeDefined();

            galleryFirstItem.simulate("click");

            expect(onClick).toBeCalled();
        });

        it("triggers correct events on Enter key down", () => {
            const onClick = jest.fn();
            const gallery = mount(<Gallery {...mockProps()} itemHelper={mockItemHelperWithAction(onClick)} />);
            const galleryFirstItem = gallery.find(".widget-gallery-item-button").at(0);

            expect(galleryFirstItem).toBeDefined();

            galleryFirstItem.simulate("keydown", { key: "Enter", code: "Enter" });
            galleryFirstItem.simulate("keyup", { key: "Enter", code: "Enter" });

            expect(onClick).toBeCalled();
        });

        it("triggers correct events on Space key down", () => {
            const onClick = jest.fn();
            const gallery = mount(<Gallery {...mockProps()} itemHelper={mockItemHelperWithAction(onClick)} />);
            const galleryFirstItem = gallery.find(".widget-gallery-item-button").at(0);

            expect(galleryFirstItem).toBeDefined();

            galleryFirstItem.simulate("keydown", { key: " ", code: "Space" });
            galleryFirstItem.simulate("keyup", { key: " ", code: "Space" });

            expect(onClick).toBeCalled();
        });
    });

    describe("with different configurations per platform", () => {
        it("contains correct classes for desktop", () => {
            const gallery = mount(<Gallery {...mockProps()} desktopItems={12} />);

            expect(gallery.find(".widget-gallery-items").hasClass("widget-gallery-lg-12")).toBeTruthy();
        });

        it("contains correct classes for tablet", () => {
            const gallery = mount(<Gallery {...mockProps()} tabletItems={6} />);

            expect(gallery.find(".widget-gallery-items").hasClass("widget-gallery-md-6")).toBeTruthy();
        });

        it("contains correct classes for phone", () => {
            const gallery = mount(<Gallery {...mockProps()} phoneItems={3} />);

            expect(gallery.find(".widget-gallery-items").hasClass("widget-gallery-sm-3")).toBeTruthy();
        });
    });

    describe("with custom classes", () => {
        it("contains correct classes in the wrapper", () => {
            const gallery = mount(<Gallery {...mockProps()} className="custom-class" />);

            expect(gallery.hasClass("custom-class")).toBeTruthy();
        });

        it("contains correct classes in the items", () => {
            const gallery = mount(
                <Gallery
                    {...mockProps()}
                    itemHelper={WidgetItemBuilder.sample(b => b.withItemClass(listExp(() => "custom-class")))}
                />
            );
            const galleryFirstItem = gallery.find(".widget-gallery-item").at(0);

            expect(galleryFirstItem.hasClass("custom-class")).toBeTruthy();
        });
    });

    describe("with pagination", () => {
        it("renders correctly", () => {
            const gallery = render(
                <Gallery {...mockProps()} paging paginationPosition="above" numberOfItems={20} hasMoreItems />
            );

            expect(gallery).toMatchSnapshot();
        });

        it("triggers correct events on click next button", () => {
            const setPage = jest.fn();
            const gallery = mount(
                <Gallery
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
                <Gallery
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
                <Gallery
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
            const gallery = render(<Gallery {...filters} />);

            expect(gallery).toMatchSnapshot();
        });
    });
});
