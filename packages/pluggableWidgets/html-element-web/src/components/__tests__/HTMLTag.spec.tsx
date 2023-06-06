import { createElement } from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HTMLTag } from "../HTMLTag";

describe("HTMLTag", () => {
    it("renders correctly with innerHTML", () => {
        const { asFragment } = render(
            <HTMLTag
                tagName="div"
                unsafeHTML="<p>Lorem ipsum</p>"
                attributes={{
                    className: "html-element-root my-class"
                }}
            >
                {undefined}
            </HTMLTag>
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("renders correctly with content", () => {
        const { asFragment } = render(
            <HTMLTag
                tagName="div"
                unsafeHTML={undefined}
                attributes={{
                    className: "html-element-root my-another-class",
                    style: { color: "red" }
                }}
            >
                <div>Lorem ipsum</div>
            </HTMLTag>
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("with innerHTML apply html sanitizing", () => {
        const checkSapshot = (html: string): void => {
            expect(
                render(
                    <HTMLTag
                        tagName="div"
                        unsafeHTML={html}
                        attributes={{
                            className: "html-element-root my-class"
                        }}
                    >
                        {undefined}
                    </HTMLTag>
                ).asFragment()
            ).toMatchSnapshot();
        };

        checkSapshot("<p>Lorem ipsum <script>alert(1)</script></p>");
        checkSapshot("<img src=x onerror=alert(1)>");
        checkSapshot(`<b onmouseover=alert(‘XSS testing!‘)>ok</b>`);
        checkSapshot("<a>123</a><option><style><img src=x onerror=alert(1)></style>");
    });

    it("fires events", async () => {
        const cbFn = jest.fn();
        const { getByTestId } = render(
            <HTMLTag
                tagName="div"
                unsafeHTML={undefined}
                attributes={{
                    "data-testid": "html-element",
                    onClick: _e => {
                        cbFn();
                    }
                }}
            >
                <div>Lorem ipsum</div>
            </HTMLTag>
        );

        await userEvent.click(getByTestId("html-element"));

        expect(cbFn).toHaveBeenCalled();
    });
});
