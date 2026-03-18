import { GalleryContainerProps } from "../../../../typings/GalleryProps";
import { mockContainerProps } from "../../../utils/mock-container-props";
import { galleryPaginationConfig, resolveInitPageSize } from "../GalleryPagination.config";

describe("galleryPaginationConfig", () => {
    it("should create a frozen config object based on props", () => {
        const props = mockContainerProps();
        const config = galleryPaginationConfig(props);

        expect(Object.isFrozen(config)).toBe(true);
        // expect(config).toMatchSnapshot();
    });
});

describe("resolveInitPageSize", () => {
    function makeProps(overrides: Partial<GalleryContainerProps> = {}): GalleryContainerProps {
        return { ...mockContainerProps(), ...overrides };
    }

    it("returns 0 when dynamicPage attribute is set", () => {
        const props = makeProps({ dynamicPage: {} as GalleryContainerProps["dynamicPage"] });
        expect(resolveInitPageSize(props)).toBe(0);
    });

    it("returns 0 when both dynamicPage and dynamicPageSize are set", () => {
        const props = makeProps({
            dynamicPage: {} as GalleryContainerProps["dynamicPage"],
            dynamicPageSize: { value: { toNumber: () => 25 } } as GalleryContainerProps["dynamicPageSize"]
        });
        expect(resolveInitPageSize(props)).toBe(0);
    });

    it("returns dynamicPageSize value when dynamicPage is not set and value is available", () => {
        const props = makeProps({
            dynamicPageSize: { value: { toNumber: () => 25 } } as GalleryContainerProps["dynamicPageSize"]
        });
        expect(resolveInitPageSize(props)).toBe(25);
    });

    it("falls back to pageSize when dynamicPageSize has no value", () => {
        const props = makeProps({
            pageSize: 10,
            dynamicPageSize: { value: undefined } as GalleryContainerProps["dynamicPageSize"]
        });
        expect(resolveInitPageSize(props)).toBe(10);
    });

    it("falls back to pageSize when dynamicPageSize is not set", () => {
        const props = makeProps({ pageSize: 10 });
        expect(resolveInitPageSize(props)).toBe(10);
    });
});
