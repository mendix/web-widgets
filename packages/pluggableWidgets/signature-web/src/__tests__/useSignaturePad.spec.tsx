import "@testing-library/jest-dom";
import { act, render } from "@testing-library/react";
import { ReactElement } from "react";
import SignaturePad from "signature_pad";
import { EditableValueBuilder } from "@mendix/widget-plugin-test-utils";
import { SignatureContainerProps } from "../../typings/SignatureProps";
import { useSignaturePad } from "../utils/useSignaturePad";

type ImageSource = SignatureContainerProps["imageSource"];

jest.mock("signature_pad", () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(function (this: any) {
        this.on = jest.fn();
        this.off = jest.fn();
        this.redraw = jest.fn();
        this.addEventListener = jest.fn();
        this.isEmpty = jest.fn(() => true);
    })
}));

const MockSignaturePad = SignaturePad as jest.MockedClass<typeof SignaturePad>;

global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
}));

function buildImageSource(overrides: Partial<ImageSource> = {}): ImageSource {
    return {
        ...new EditableValueBuilder<string>().isUnavailable().build(),
        ...overrides
    } as unknown as ImageSource;
}

// Wrapper component that mounts both refs into real DOM nodes
function TestHarness({ imageSource }: { imageSource: ImageSource }): ReactElement {
    const { containerRef, canvasRef } = useSignaturePad({ imageSource, penType: "ballpoint", penColor: "#000000" });
    return (
        <div ref={containerRef} data-testid="container">
            <canvas ref={canvasRef} data-testid="canvas" />
        </div>
    );
}

describe("useSignaturePad — canvas initialization", () => {
    // jsdom doesn't do layout, so offsetWidth/Height are always 0.
    // Stub them on the prototype before each test so the init effect reads real numbers.
    let offsetWidthSpy: jest.SpyInstance;
    let offsetHeightSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        offsetWidthSpy?.mockRestore();
        offsetHeightSpy?.mockRestore();
    });

    function stubContainerDimensions(width: number, height: number): void {
        offsetWidthSpy = jest.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(width);
        offsetHeightSpy = jest.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(height);
    }

    it("sizes canvas to containerRef dimensions when imageSource is unavailable", () => {
        stubContainerDimensions(400, 200);
        const imageSource = buildImageSource();

        const { getByTestId } = render(<TestHarness imageSource={imageSource} />);

        const canvas = getByTestId("canvas") as HTMLCanvasElement;
        expect(canvas.width).toBe(400);
        expect(canvas.height).toBe(200);
        expect(MockSignaturePad).toHaveBeenCalledWith(canvas, expect.any(Object));
    });

    it("sizes canvas to containerRef dimensions when imageSource is available with a value", () => {
        stubContainerDimensions(600, 300);
        const imageSource = buildImageSource({
            status: "available" as any,
            value: { uri: "data:image/png;base64,abc" } as any,
            readOnly: false
        });

        const { getByTestId } = render(<TestHarness imageSource={imageSource} />);

        const canvas = getByTestId("canvas") as HTMLCanvasElement;
        expect(canvas.width).toBe(600);
        expect(canvas.height).toBe(300);
        expect(MockSignaturePad).toHaveBeenCalledWith(canvas, expect.any(Object));
    });

    it("does not initialize SignaturePad when imageSource is still loading", () => {
        const imageSource = buildImageSource({ status: "loading" as any, readOnly: true });

        render(<TestHarness imageSource={imageSource} />);

        act(() => {});

        expect(MockSignaturePad).not.toHaveBeenCalled();
    });
});
