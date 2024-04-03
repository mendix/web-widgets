import { createElement } from "react";
import { mount, render } from "enzyme";
import { Gallery, GalleryProps } from "../../components/Gallery";
import { ObjectItem } from "mendix";
import { WidgetItemBuilder } from "../../utils/test-utils";
import { listAction, listExp, objectItems } from "@mendix/widget-plugin-test-utils";
import { ItemHelper } from "../../helpers/ItemHelper";
import "./__mocks__/intersectionObserverMock";
import { ItemEventsController } from "../../features/item-interaction/ItemEventsController";
import { ClickActionHelper } from "@mendix/widget-plugin-grid/helpers/ClickActionHelper";
import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import { PositionController } from "@mendix/widget-plugin-grid/keyboard-navigation/PositionController";
import { VirtualGridLayout } from "@mendix/widget-plugin-grid/keyboard-navigation/VirtualGridLayout";
import { getColumnAndRowBasedOnIndex, SelectActionHandler } from "@mendix/widget-plugin-grid/selection";

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

function mockProps(): GalleryProps<ObjectItem> & { onClick: jest.Mock } {
    const selectHelper = new SelectActionHandler("None", undefined);
    const onClick = jest.fn();
    const clickHelper = new ClickActionHelper("single", onClick);
    const focusController = new FocusTargetController(new PositionController(), new VirtualGridLayout(3, 4, 10));

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
        selectHelper,
        showHeader: true,
        header: <input />,
        itemEventsController: new ItemEventsController(
            item => ({
                item,
                selectionType: selectHelper.selectionType,
                selectionMode: "clear",
                clickTrigger: "single"
            }),
            selectHelper.onSelect,
            selectHelper.onSelectAll,
            clickHelper.onExecuteAction,
            focusController.dispatch,
            selectHelper.onSelectAdjacent,
            3
        ),
        focusController,
        getPosition: (index: number) => getColumnAndRowBasedOnIndex(3, 3, index),
        onClick
    };
}

function sleep(n: number): Promise<void> {
    return new Promise(res => setTimeout(res, n));
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
        it("triggers correct events on click", async () => {
            const props = mockProps();
            const itemHelper = mockItemHelperWithAction(props.onClick);
            const gallery = mount(<Gallery {...props} itemHelper={itemHelper} />);
            const galleryFirstItem = gallery.find(".widget-gallery-item-button").at(0);

            expect(galleryFirstItem).toBeDefined();

            galleryFirstItem.simulate("click", { bubbles: true });
            await sleep(500);

            expect(props.onClick).toBeCalled();
        });

        it("triggers correct events on Enter key down", () => {
            const props = mockProps();
            const gallery = mount(<Gallery {...props} itemHelper={mockItemHelperWithAction(props.onClick)} />);
            const galleryFirstItem = gallery.find(".widget-gallery-item").at(0);

            expect(galleryFirstItem).toBeDefined();

            galleryFirstItem.simulate("keydown", { key: "Enter", code: "Enter", bubbles: true });
            galleryFirstItem.simulate("keyup", { key: "Enter", code: "Enter", bubbles: true });

            expect(props.onClick).toBeCalled();
        });

        it("triggers correct events on Space key down", () => {
            const onClick = jest.fn();
            const gallery = mount(<Gallery {...mockProps()} itemHelper={mockItemHelperWithAction(onClick)} />);
            const galleryFirstItem = gallery.find(".widget-gallery-item-button").at(0);

            expect(galleryFirstItem).toBeDefined();

            galleryFirstItem.simulate("keydown", { key: " ", code: "Space", bubbles: true });
            galleryFirstItem.simulate("keyup", { key: " ", code: "Space", bubbles: true });

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
