import { render } from "@testing-library/react";

import { preview } from "../ChartPlayground.editorPreview";

describe("preview", () => {
    it("renders toggle button", () => {
        const { asFragment } = render(preview());
        expect(asFragment()).toMatchSnapshot();
    });
});
