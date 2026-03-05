import { mockContainerProps } from "../../../utils/mock-container-props";
import { GalleryGateProps } from "../../../typings/GalleryGateProps";
import {
    dynamicPageEnabled,
    dynamicPageSizeEnabled,
    galleryPaginationConfig,
    requestTotalCount
} from "../GalleryPagination.config";

describe("galleryPaginationConfig", () => {
    it("should create a frozen config object based on props", () => {
        const props = mockContainerProps();
        const config = galleryPaginationConfig(props);

        expect(Object.isFrozen(config)).toBe(true);
        // expect(config).toMatchSnapshot();
    });

    it("disables dynamic page and page size in limit-based pagination modes", () => {
        const withDynamicAttrs = {
            ...mockContainerProps(),
            pagination: "virtualScrolling",
            dynamicPage: {} as never,
            dynamicPageSize: {} as never
        } satisfies GalleryGateProps;

        expect(dynamicPageEnabled(withDynamicAttrs)).toBe(false);
        expect(dynamicPageSizeEnabled(withDynamicAttrs)).toBe(false);
    });

    it("enables dynamic page and page size in buttons mode when attributes are mapped", () => {
        const withDynamicAttrs = {
            ...mockContainerProps(),
            pagination: "buttons",
            dynamicPage: {} as never,
            dynamicPageSize: {} as never
        } satisfies GalleryGateProps;

        expect(dynamicPageEnabled(withDynamicAttrs)).toBe(true);
        expect(dynamicPageSizeEnabled(withDynamicAttrs)).toBe(true);
    });

    it("requests total count for buttons mode", () => {
        const props = {
            ...mockContainerProps(),
            pagination: "buttons",
            showTotalCount: false
        } satisfies GalleryGateProps;
        expect(requestTotalCount(props)).toBe(true);
    });

    it("requests total count when total count display is enabled", () => {
        const props = {
            ...mockContainerProps(),
            pagination: "loadMore",
            showTotalCount: true
        } satisfies GalleryGateProps;
        expect(requestTotalCount(props)).toBe(true);
    });

    it("does not request total count for non-buttons modes when count display is disabled", () => {
        const props = {
            ...mockContainerProps(),
            pagination: "loadMore",
            showTotalCount: false
        } satisfies GalleryGateProps;
        expect(requestTotalCount(props)).toBe(false);
    });
});
