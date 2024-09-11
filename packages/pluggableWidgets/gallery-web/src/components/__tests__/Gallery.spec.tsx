import "@testing-library/jest-dom";
import { listAction, listExp } from "@mendix/widget-plugin-test-utils";
import { waitFor, render } from "@testing-library/react";
import { createElement } from "react";
import { Gallery } from "../Gallery";
import { ItemHelperBuilder } from "../../utils/builders/ItemHelperBuilder";
import { mockProps, mockItemHelperWithAction, setup } from "../../utils/test-utils";
import "./__mocks__/intersectionObserverMock";

describe("Gallery", () => {
    describe("DOM Structure", () => {
        it("renders correctly", () => {
            const { asFragment } = render(<Gallery {...mockProps()} />);

            expect(asFragment()).toMatchSnapshot();
        });

        it("renders correctly with onclick event", () => {
            const { asFragment } = render(
                <Gallery {...mockProps()} itemHelper={mockItemHelperWithAction(jest.fn())} />
            );

            expect(asFragment()).toMatchSnapshot();
        });
    });

    describe("with on click action", () => {
        it("runs action on item click", async () => {
            const execute = jest.fn();
            const props = mockProps({ onClick: listAction(mock => ({ ...mock(), execute })) });
            const { user, getAllByRole } = setup(<Gallery {...props} />);
            const [item] = getAllByRole("listitem");

            await user.click(item);
            await waitFor(() => expect(execute).toHaveBeenCalledTimes(1));
        });

        it("runs action on Enter|Space press when item is in focus", async () => {
            const execute = jest.fn();
            const props = mockProps({ onClick: listAction(mock => ({ ...mock(), execute })) });
            const { user, getAllByRole } = setup(<Gallery {...props} header={<span />} />);
            const [item] = getAllByRole("listitem");

            await user.tab();
            expect(item).toHaveFocus();
            await user.keyboard("[Enter]");
            await waitFor(() => expect(execute).toHaveBeenCalledTimes(1));
            await user.keyboard("[Space]");
            await waitFor(() => expect(execute).toHaveBeenCalledTimes(2));
        });
    });

    describe("with different configurations per platform", () => {
        it("contains correct classes for desktop", () => {
            const { getByRole } = render(<Gallery {...mockProps()} desktopItems={12} />);
            const list = getByRole("list");
            expect(list).toHaveClass("widget-gallery-lg-12");
        });

        it("contains correct classes for tablet", () => {
            const { getByRole } = render(<Gallery {...mockProps()} tabletItems={6} />);
            const list = getByRole("list");
            expect(list).toHaveClass("widget-gallery-md-6");
        });

        it("contains correct classes for phone", () => {
            const { getByRole } = render(<Gallery {...mockProps()} phoneItems={3} />);
            const list = getByRole("list");
            expect(list).toHaveClass("widget-gallery-sm-3");
        });
    });

    describe("with custom classes", () => {
        it("contains correct classes in the wrapper", () => {
            const { container } = render(<Gallery {...mockProps()} className="custom-class" />);

            expect(container.querySelector(".custom-class")).toBeVisible();
        });

        it("contains correct classes in the items", () => {
            const { getAllByRole } = render(
                <Gallery
                    {...mockProps()}
                    itemHelper={ItemHelperBuilder.sample(b => b.withItemClass(listExp(() => "custom-class")))}
                />
            );
            const [item] = getAllByRole("listitem");

            expect(item).toHaveClass("custom-class");
        });
    });

    describe("with pagination", () => {
        it("renders correctly", () => {
            const { asFragment } = render(
                <Gallery {...mockProps()} paging paginationPosition="above" numberOfItems={20} hasMoreItems />
            );

            expect(asFragment()).toMatchSnapshot();
        });

        it("triggers correct events on click next button", async () => {
            const setPage = jest.fn();
            const { user, getByLabelText } = setup(
                <Gallery
                    {...mockProps()}
                    paging
                    paginationPosition="above"
                    numberOfItems={20}
                    hasMoreItems
                    setPage={setPage}
                />
            );

            const next = getByLabelText("Go to next page");
            await user.click(next);
            await waitFor(() => expect(setPage).toHaveBeenCalledTimes(1));
        });
    });

    describe("with empty option", () => {
        it("renders correctly", () => {
            const { asFragment } = render(
                <Gallery
                    {...mockProps()}
                    items={[]}
                    emptyPlaceholderRenderer={renderWrapper => renderWrapper(<span>No items found</span>)}
                />
            );

            expect(asFragment()).toMatchSnapshot();
        });
    });

    describe("with accessibility properties", () => {
        it("renders correctly", () => {
            const { asFragment } = render(
                <Gallery
                    {...mockProps()}
                    items={[]}
                    headerTitle="filter title"
                    emptyMessageTitle="empty message"
                    emptyPlaceholderRenderer={renderWrapper => renderWrapper(<span>No items found</span>)}
                />
            );

            expect(asFragment()).toMatchSnapshot();
        });
    });

    describe("without filters", () => {
        it("renders structure without header container", () => {
            const props = { ...mockProps(), showHeader: false, header: undefined };
            const { asFragment } = render(<Gallery {...props} />);

            expect(asFragment()).toMatchSnapshot();
        });
    });
});
