import { mockContainerProps } from "../../../utils/mock-container-props";
import { galleryPaginationConfig } from "../GalleryPagination.config";

describe("galleryPaginationConfig", () => {
    it("should create a frozen config object based on props", () => {
        const props = mockContainerProps();
        const config = galleryPaginationConfig(props);

        expect(Object.isFrozen(config)).toBe(true);
        // expect(config).toMatchSnapshot();
    });
});
