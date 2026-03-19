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

    it("returns 0 when dynamicPageSize attribute is set", () => {
        const props = makeProps({ dynamicPageSize: {} as GalleryContainerProps["dynamicPageSize"] });
        expect(resolveInitPageSize(props)).toBe(0);
    });

    it("falls back to pageSize when dynamicPageSize is not set", () => {
        const props = makeProps({ pageSize: 10 });
        expect(resolveInitPageSize(props)).toBe(10);
    });
});
