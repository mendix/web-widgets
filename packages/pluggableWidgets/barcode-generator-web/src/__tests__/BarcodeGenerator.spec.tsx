import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { EditableValueBuilder } from "@mendix/widget-plugin-test-utils";

// Mock JsBarcode
const mockJsBarcode = jest.fn();
const barcodeDefaultValue = `default barcode value`;
jest.mock("jsbarcode", () => mockJsBarcode);

// Mock the QRCodeSVG component
jest.mock("qrcode.react", () => ({
    QRCodeSVG: ({ value, size }: { value: string; size: number }) => (
        <div data-testid="qr-code" data-value={value} data-size={size}>
            QR Code: {value}
        </div>
    )
}));

import BarcodeGenerator from "../BarcodeGenerator";
import { CodeFormatEnum, CustomCodeFormatEnum } from "typings/BarcodeGeneratorProps";

describe("BarcodeGenerator", () => {
    const defaultProps = {
        name: "barcodeGenerator1",
        class: "mx-barcode-generator",
        tabIndex: -1,
        codeFormat: "QRCode" as CodeFormatEnum,
        displayValue: false,
        codeWidth: 2,
        codeHeight: 200,
        qrSize: 128,
        codeMargin: 4,
        customCodeFormat: "CODE128" as CustomCodeFormatEnum,
        codeValue: new EditableValueBuilder<string>().withValue(barcodeDefaultValue).build()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders QR code when value is available", () => {
        const props = {
            ...defaultProps,
            codeValue: {
                value: "Hello World",
                status: "available"
            } as any
        };

        render(<BarcodeGenerator {...props} />);

        expect(screen.getByTestId("qr-code")).toBeInTheDocument();
        expect(screen.getByTestId("qr-code")).toHaveAttribute("data-value", "Hello World");
        expect(screen.getByTestId("qr-code")).toHaveAttribute("data-size", "128");
    });

    it("shows no barcode message when data is loading", () => {
        const props = {
            ...defaultProps,
            codeValue: {
                value: "",
                status: "loading"
            } as any
        };

        render(<BarcodeGenerator {...props} />);

        expect(screen.queryByTestId("qr-code")).not.toBeInTheDocument();
        expect(screen.getByText("No barcode value provided")).toBeInTheDocument();
    });

    it("shows no barcode message when data is unavailable", () => {
        const props = {
            ...defaultProps,
            codeValue: {
                value: "",
                status: "unavailable"
            } as any
        };

        render(<BarcodeGenerator {...props} />);

        expect(screen.queryByTestId("qr-code")).not.toBeInTheDocument();
        expect(screen.getByText("No barcode value provided")).toBeInTheDocument();
    });

    it("renders CODE128 barcode when format is not QR", () => {
        const props = {
            ...defaultProps,
            codeFormat: "CODE128" as const,
            codeValue: {
                value: "123456789",
                status: "available"
            } as any
        };

        render(<BarcodeGenerator {...props} />);

        // Should not render QR code
        expect(screen.queryByTestId("qr-code")).not.toBeInTheDocument();

        // Should have called JsBarcode
        expect(mockJsBarcode).toHaveBeenCalledWith(
            expect.any(Object), // SVG element
            "123456789",
            {
                format: "CODE128",
                width: 2,
                height: 200,
                margin: 4,
                displayValue: false
            }
        );
    });

    it("renders QR code with custom size", () => {
        const props = {
            ...defaultProps,
            qrSize: 256,
            codeValue: {
                value: "Custom Size QR",
                status: "available"
            } as any
        };

        render(<BarcodeGenerator {...props} />);

        expect(screen.getByTestId("qr-code")).toHaveAttribute("data-size", "256");
    });

    it("passes displayValue option to JSBarcode for non-QR codes", () => {
        const props = {
            ...defaultProps,
            codeFormat: "CODE128" as const,
            displayValue: true,
            codeValue: {
                value: "DISPLAY123",
                status: "available"
            } as any
        };

        render(<BarcodeGenerator {...props} />);

        expect(mockJsBarcode).toHaveBeenCalledWith(
            expect.any(Object),
            "DISPLAY123",
            expect.objectContaining({
                displayValue: true
            })
        );
    });

    it("handles JSBarcode errors gracefully", () => {
        const consoleSpy = jest.spyOn(console, "error").mockImplementation();
        mockJsBarcode.mockImplementation(() => {
            throw new Error("Invalid barcode format");
        });

        const props = {
            ...defaultProps,
            codeFormat: "CODE128" as const,
            codeValue: {
                value: "INVALID",
                status: "available"
            } as any
        };

        render(<BarcodeGenerator {...props} />);

        expect(consoleSpy).toHaveBeenCalledWith("Error generating barcode:", expect.any(Error));
        consoleSpy.mockRestore();
    });

    it("applies correct CSS class and tabIndex", () => {
        const props = {
            ...defaultProps,
            class: "mx-barcode-generator custom-class",
            tabIndex: 5,
            codeValue: {
                value: "CSS Test",
                status: "available"
            } as any
        };

        const { container } = render(<BarcodeGenerator {...props} />);

        const widget = container.firstChild as HTMLElement;
        expect(widget).toHaveClass("barcode-generator");
        expect(widget).toHaveAttribute("tabIndex", "5");
    });

    it("uses fallback values when props are missing", () => {
        const props = {
            ...defaultProps,
            codeFormat: "CODE128" as const,
            codeValue: {
                value: "DEFAULT_TEST",
                status: "available"
            } as any
        };

        // Component uses nullish coalescing to provide defaults
        render(<BarcodeGenerator {...props} />);

        expect(mockJsBarcode).toHaveBeenCalledWith(expect.any(Object), "DEFAULT_TEST", {
            format: "CODE128",
            width: 2, // from defaultProps
            height: 200, // from defaultProps
            margin: 4, // from defaultProps
            displayValue: false
        });
    });
});
