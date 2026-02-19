import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditableValueBuilder } from "@mendix/widget-plugin-test-utils";

// Mock JsBarcode
const mockJsBarcode = jest.fn();
jest.mock("jsbarcode", () => mockJsBarcode);

// Mock the QRCodeSVG component
jest.mock("qrcode.react", () => ({
    QRCodeSVG: ({ value, size, level, marginSize, title, imageSettings }: any) => (
        <div
            data-testid="qr-code"
            data-value={value}
            data-size={size}
            data-level={level}
            data-margin={marginSize}
            data-title={title}
            data-image={imageSettings ? "true" : "false"}
        >
            QR Code: {value}
        </div>
    )
}));

// Mock download functionality
jest.mock("../utils/download-code", () => ({
    downloadCode: jest.fn()
}));

import BarcodeGenerator from "../BarcodeGenerator";
import { CodeFormatEnum, CustomCodeFormatEnum } from "typings/BarcodeGeneratorProps";
import { downloadCode } from "../utils/download-code";

// Test utilities
const createMockWebImage = (status: "available" | "loading" | "unavailable" = "unavailable"): any => {
    if (status === "available") {
        return {
            status: "available" as const,
            value: { uri: "data:image/png;base64,test123" }
        } as any;
    }
    return { status } as any;
};

const createBarcodeProps = (overrides: any = {}): any => ({
    name: "barcodeGenerator1",
    class: "mx-barcode-generator",
    tabIndex: -1,
    codeFormat: "QRCode" as CodeFormatEnum,
    customCodeFormat: "CODE128" as CustomCodeFormatEnum,
    enableEan128: false,
    enableFlat: false,
    lastChar: "",
    enableMod43: false,
    allowDownload: false,
    downloadButtonCaption: { status: "available" as const, value: "Download" } as any,
    downloadButtonAriaLabel: { status: "available" as const, value: "Download barcode" } as any,
    displayValue: false,
    showAsCard: false,
    codeWidth: 2,
    codeHeight: 200,
    codeMargin: 4,
    qrSize: 128,
    qrMargin: 2,
    qrTitle: "",
    qrLevel: "L" as any,
    qrImage: false,
    qrImageSrc: createMockWebImage(),
    qrImageCenter: true,
    qrImageX: 0,
    qrImageY: 0,
    qrImageHeight: 24,
    qrImageWidth: 24,
    qrImageOpacity: { toNumber: () => 1 } as any,
    qrImageExcavate: true,
    addonFormat: "None" as any,
    addonValue: { status: "unavailable" as const } as any,
    addonSpacing: 20,
    buttonPosition: "bottom" as const,
    codeValue: new EditableValueBuilder<string>().withValue("test-barcode-value").build(),
    ...overrides
});

describe("BarcodeGenerator", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ============= Core Rendering Tests =============
    describe("core rendering", () => {
        it("renders QR code when codeValue is available", () => {
            const props = createBarcodeProps({
                codeValue: {
                    value: "Hello World",
                    status: "available"
                } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(screen.getByTestId("qr-code")).toBeInTheDocument();
            expect(screen.getByTestId("qr-code")).toHaveAttribute("data-value", "Hello World");
            expect(screen.getByTestId("qr-code")).toHaveAttribute("data-size", "128");
        });

        it("shows fallback message when codeValue is loading", () => {
            const props = createBarcodeProps({
                codeValue: { value: "", status: "loading" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(screen.queryByTestId("qr-code")).not.toBeInTheDocument();
            expect(screen.getByText("No barcode value provided")).toBeInTheDocument();
        });

        it("shows fallback message when codeValue is unavailable", () => {
            const props = createBarcodeProps({
                codeValue: { value: "", status: "unavailable" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(screen.queryByTestId("qr-code")).not.toBeInTheDocument();
            expect(screen.getByText("No barcode value provided")).toBeInTheDocument();
        });

        it("applies correct CSS classes and tabIndex", () => {
            const props = createBarcodeProps({
                class: "custom-class",
                tabIndex: 2,
                codeValue: { value: "test", status: "available" } as any
            });

            const { container } = render(<BarcodeGenerator {...props} />);
            const widget = container.firstChild as HTMLElement;

            expect(widget).toHaveClass("barcode-generator", "custom-class");
            expect(widget).toHaveAttribute("tabIndex", "2");
        });

        it("applies card styling when showAsCard is true", () => {
            const props = createBarcodeProps({
                showAsCard: true,
                codeValue: { value: "test", status: "available" } as any
            });

            const { container } = render(<BarcodeGenerator {...props} />);
            const widget = container.firstChild as HTMLElement;

            expect(widget).toHaveClass("barcode-generator--as-card");
        });
    });

    // ============= Barcode Format Tests =============
    describe("barcode formats", () => {
        it("renders CODE128 barcode correctly", () => {
            const props = createBarcodeProps({
                codeFormat: "CODE128" as CodeFormatEnum,
                codeValue: { value: "123456789", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(mockJsBarcode).toHaveBeenCalledWith(
                expect.any(Object),
                "123456789",
                expect.objectContaining({ format: "CODE128" })
            );
        });

        it("renders CODE39 barcode with uppercase letters and special characters", () => {
            const props = createBarcodeProps({
                codeFormat: "Custom" as CodeFormatEnum,
                customCodeFormat: "CODE39" as CustomCodeFormatEnum,
                codeValue: { value: "ABC-123", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(mockJsBarcode).toHaveBeenCalledWith(
                expect.any(Object),
                "ABC-123",
                expect.objectContaining({ format: "CODE39" })
            );
        });

        it("renders CODE93 barcode", () => {
            const props = createBarcodeProps({
                codeFormat: "Custom" as CodeFormatEnum,
                customCodeFormat: "CODE93" as CustomCodeFormatEnum,
                codeValue: { value: "CODE93VALUE", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(mockJsBarcode).toHaveBeenCalledWith(
                expect.any(Object),
                "CODE93VALUE",
                expect.objectContaining({ format: "CODE93" })
            );
        });

        it("renders EAN-13 barcode with 13 digits", () => {
            const props = createBarcodeProps({
                codeFormat: "Custom" as CodeFormatEnum,
                customCodeFormat: "EAN13" as CustomCodeFormatEnum,
                codeValue: { value: "1234567890128", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(mockJsBarcode).toHaveBeenCalledWith(
                expect.any(Object),
                "1234567890128",
                expect.objectContaining({ format: "EAN13" })
            );
        });

        it("renders EAN-8 barcode with 8 digits", () => {
            const props = createBarcodeProps({
                codeFormat: "Custom" as CodeFormatEnum,
                customCodeFormat: "EAN8" as CustomCodeFormatEnum,
                codeValue: { value: "12345678", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(mockJsBarcode).toHaveBeenCalledWith(
                expect.any(Object),
                "12345678",
                expect.objectContaining({ format: "EAN8" })
            );
        });

        it("renders UPC barcode with 12 digits", () => {
            const props = createBarcodeProps({
                codeFormat: "Custom" as CodeFormatEnum,
                customCodeFormat: "UPC" as CustomCodeFormatEnum,
                codeValue: { value: "123456789012", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(mockJsBarcode).toHaveBeenCalledWith(
                expect.any(Object),
                "123456789012",
                expect.objectContaining({ format: "UPC" })
            );
        });

        it("renders ITF-14 barcode with exactly 14 digits", () => {
            const props = createBarcodeProps({
                codeFormat: "Custom" as CodeFormatEnum,
                customCodeFormat: "ITF14" as CustomCodeFormatEnum,
                codeValue: { value: "12345678901234", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(mockJsBarcode).toHaveBeenCalledWith(
                expect.any(Object),
                "12345678901234",
                expect.objectContaining({ format: "ITF14" })
            );
        });

        it("renders MSI barcode with numeric digits", () => {
            const props = createBarcodeProps({
                codeFormat: "Custom" as CodeFormatEnum,
                customCodeFormat: "MSI" as CustomCodeFormatEnum,
                codeValue: { value: "123456", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(mockJsBarcode).toHaveBeenCalledWith(
                expect.any(Object),
                "123456",
                expect.objectContaining({ format: "MSI" })
            );
        });

        it("renders Pharmacode barcode with numeric digits", () => {
            const props = createBarcodeProps({
                codeFormat: "Custom" as CodeFormatEnum,
                customCodeFormat: "pharmacode" as CustomCodeFormatEnum,
                codeValue: { value: "1234567", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(mockJsBarcode).toHaveBeenCalledWith(
                expect.any(Object),
                "1234567",
                expect.objectContaining({ format: "pharmacode" })
            );
        });

        it("renders Codabar barcode", () => {
            const props = createBarcodeProps({
                codeFormat: "Custom" as CodeFormatEnum,
                customCodeFormat: "codabar" as CustomCodeFormatEnum,
                codeValue: { value: "123-456", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(mockJsBarcode).toHaveBeenCalledWith(
                expect.any(Object),
                "123-456",
                expect.objectContaining({ format: "codabar" })
            );
        });
    });

    // ============= QR Code Tests =============
    describe("QR code rendering", () => {
        it("renders QR code with custom size", () => {
            const props = createBarcodeProps({
                qrSize: 256,
                codeValue: { value: "Custom Size QR", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(screen.getByTestId("qr-code")).toHaveAttribute("data-size", "256");
        });

        it("renders QR code with custom margin", () => {
            const props = createBarcodeProps({
                qrMargin: 5,
                codeValue: { value: "test", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(screen.getByTestId("qr-code")).toHaveAttribute("data-margin", "5");
        });

        it("renders QR code with all error correction levels", () => {
            const levels: any[] = ["L", "M", "Q", "H"];

            levels.forEach(level => {
                const props = createBarcodeProps({
                    qrLevel: level,
                    codeValue: { value: "test", status: "available" } as any
                });

                const { unmount } = render(<BarcodeGenerator {...props} />);

                expect(screen.getAllByTestId("qr-code")[0]).toHaveAttribute("data-level", level);
                unmount();
            });
        });

        it("renders QR code with title", () => {
            const props = createBarcodeProps({
                qrTitle: "QR Code Title",
                codeValue: { value: "test", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(screen.getByText("QR Code Title")).toBeInTheDocument();
        });
    });

    // ============= QR Image Overlay Tests =============
    describe("QR image overlay functionality", () => {
        it("renders QR code with image overlay when qrImage is true", () => {
            const props = createBarcodeProps({
                qrImage: true,
                qrImageSrc: createMockWebImage("available"),
                codeValue: { value: "test", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(screen.getByTestId("qr-code")).toBeInTheDocument();
        });

        it("renders QR code with centered image overlay", () => {
            const props = createBarcodeProps({
                qrImage: true,
                qrImageSrc: createMockWebImage("available"),
                qrImageCenter: true,
                codeValue: { value: "test", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(screen.getByTestId("qr-code")).toBeInTheDocument();
        });

        it("renders QR code with positioned image overlay", () => {
            const props = createBarcodeProps({
                qrImage: true,
                qrImageSrc: createMockWebImage("available"),
                qrImageCenter: false,
                qrImageX: 10,
                qrImageY: 20,
                codeValue: { value: "test", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(screen.getByTestId("qr-code")).toBeInTheDocument();
        });

        it("renders QR code with image overlay custom dimensions", () => {
            const props = createBarcodeProps({
                qrImage: true,
                qrImageSrc: createMockWebImage("available"),
                qrImageWidth: 50,
                qrImageHeight: 50,
                codeValue: { value: "test", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(screen.getByTestId("qr-code")).toBeInTheDocument();
        });

        it("renders QR code with image overlay opacity", () => {
            const props = createBarcodeProps({
                qrImage: true,
                qrImageSrc: createMockWebImage("available"),
                qrImageOpacity: { toNumber: () => 0.75 } as any,
                codeValue: { value: "test", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(screen.getByTestId("qr-code")).toBeInTheDocument();
        });

        it("renders QR code with image excavation enabled", () => {
            const props = createBarcodeProps({
                qrImage: true,
                qrImageSrc: createMockWebImage("available"),
                qrImageExcavate: true,
                codeValue: { value: "test", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(screen.getByTestId("qr-code")).toBeInTheDocument();
        });

        it("does not render image overlay when qrImageSrc is unavailable", () => {
            const props = createBarcodeProps({
                qrImage: true,
                qrImageSrc: createMockWebImage("unavailable"),
                codeValue: { value: "test", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            // QR code should render but without image
            expect(screen.getByTestId("qr-code")).toHaveAttribute("data-image", "false");
        });
    });

    // ============= Download Button Tests =============
    describe("download button functionality", () => {
        it("does not render download button when allowDownload is false", () => {
            const props = createBarcodeProps({
                allowDownload: false,
                codeValue: { value: "test", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(screen.queryByRole("button")).not.toBeInTheDocument();
        });

        it("renders download button with custom caption", () => {
            const props = createBarcodeProps({
                allowDownload: true,
                downloadButtonCaption: { status: "available" as const, value: "Export Code" } as any,
                codeValue: { value: "test", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(screen.getByText("Export Code")).toBeInTheDocument();
        });

        it("renders download button with correct aria-label for QR code", () => {
            const props = createBarcodeProps({
                allowDownload: true,
                downloadButtonAriaLabel: { status: "available" as const, value: "Download QR code" } as any,
                codeFormat: "QRCode" as CodeFormatEnum,
                codeValue: { value: "test", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(screen.getByRole("button")).toHaveAttribute("aria-label", "Download QR code");
        });

        it("renders download button at top position", () => {
            const props = createBarcodeProps({
                allowDownload: true,
                buttonPosition: "top" as const,
                downloadButtonCaption: { status: "available" as const, value: "Download" } as any,
                codeValue: { value: "test", status: "available" } as any
            });

            const { container } = render(<BarcodeGenerator {...props} />);

            const renderer = container.querySelector(".qrcode-renderer");
            expect(renderer).toBeInTheDocument();
            // Get all children
            const children = Array.from((renderer as HTMLElement).children);
            // Download button should be first child
            const firstChild = children[0] as HTMLElement;
            expect(firstChild).toHaveClass("mx-link");
        });

        it("renders download button at bottom position", () => {
            const props = createBarcodeProps({
                allowDownload: true,
                buttonPosition: "bottom" as const,
                downloadButtonCaption: { status: "available" as const, value: "Download" } as any,
                codeValue: { value: "test", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            const button = screen.getByRole("button");
            expect(button).toBeInTheDocument();
        });

        it("calls downloadCode when download button is clicked", () => {
            const mockDownloadCode = downloadCode as jest.Mock;

            const props = createBarcodeProps({
                allowDownload: true,
                downloadButtonCaption: { status: "available" as const, value: "Download" } as any,
                codeFormat: "QRCode" as CodeFormatEnum,
                codeValue: { value: "test", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            const button = screen.getByRole("button");
            fireEvent.click(button);

            expect(mockDownloadCode).toHaveBeenCalled();
        });

        it("renders download button with icon and caption", () => {
            const props = createBarcodeProps({
                allowDownload: true,
                downloadButtonCaption: { status: "available" as const, value: "Save" } as any,
                codeValue: { value: "test", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            const button = screen.getByRole("button");
            expect(button).toHaveTextContent("Save");
        });
    });

    // ============= Barcode Display Options Tests =============
    describe("barcode display options", () => {
        it("passes displayValue option to JsBarcode correctly", () => {
            const props = createBarcodeProps({
                codeFormat: "CODE128" as CodeFormatEnum,
                displayValue: true,
                codeValue: { value: "DISPLAY123", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(mockJsBarcode).toHaveBeenCalledWith(
                expect.any(Object),
                "DISPLAY123",
                expect.objectContaining({ displayValue: true })
            );
        });

        it("does not display value when displayValue is false", () => {
            const props = createBarcodeProps({
                codeFormat: "CODE128" as CodeFormatEnum,
                displayValue: false,
                codeValue: { value: "NODISPLAY", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(mockJsBarcode).toHaveBeenCalledWith(
                expect.any(Object),
                "NODISPLAY",
                expect.objectContaining({ displayValue: false })
            );
        });

        it("applies custom width to barcode", () => {
            const props = createBarcodeProps({
                codeFormat: "CODE128" as CodeFormatEnum,
                codeWidth: 3,
                codeValue: { value: "WIDTH_TEST", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(mockJsBarcode).toHaveBeenCalledWith(
                expect.any(Object),
                "WIDTH_TEST",
                expect.objectContaining({ width: 3 })
            );
        });

        it("applies custom height to barcode", () => {
            const props = createBarcodeProps({
                codeFormat: "CODE128" as CodeFormatEnum,
                codeHeight: 300,
                codeValue: { value: "HEIGHT_TEST", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(mockJsBarcode).toHaveBeenCalledWith(
                expect.any(Object),
                "HEIGHT_TEST",
                expect.objectContaining({ height: 300 })
            );
        });

        it("applies custom margin to barcode", () => {
            const props = createBarcodeProps({
                codeFormat: "CODE128" as CodeFormatEnum,
                codeMargin: 8,
                codeValue: { value: "MARGIN_TEST", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(mockJsBarcode).toHaveBeenCalledWith(
                expect.any(Object),
                "MARGIN_TEST",
                expect.objectContaining({ margin: 8 })
            );
        });
    });

    // ============= Advanced Barcode Options Tests =============
    describe("advanced barcode options", () => {
        it("applies EAN-128 encoding when enabled", () => {
            const props = createBarcodeProps({
                codeFormat: "CODE128" as CodeFormatEnum,
                enableEan128: true,
                codeValue: { value: "EAN128TEST", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(mockJsBarcode).toHaveBeenCalledWith(
                expect.any(Object),
                "EAN128TEST",
                expect.objectContaining({ ean128: true })
            );
        });

        it("applies flat mode when enabled", () => {
            const props = createBarcodeProps({
                codeFormat: "CODE128" as CodeFormatEnum,
                enableFlat: true,
                codeValue: { value: "FLATTEST", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(mockJsBarcode).toHaveBeenCalledWith(
                expect.any(Object),
                "FLATTEST",
                expect.objectContaining({ flat: true })
            );
        });

        it("applies MOD43 checksum when enabled", () => {
            const props = createBarcodeProps({
                codeFormat: "CODE128" as CodeFormatEnum,
                enableMod43: true,
                codeValue: { value: "MOD43TEST", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(mockJsBarcode).toHaveBeenCalledWith(
                expect.any(Object),
                "MOD43TEST",
                expect.objectContaining({ mod43: true })
            );
        });

        it("applies custom last character", () => {
            const props = createBarcodeProps({
                codeFormat: "CODE128" as CodeFormatEnum,
                lastChar: "X",
                codeValue: { value: "LASTCHARTEST", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(mockJsBarcode).toHaveBeenCalledWith(
                expect.any(Object),
                "LASTCHARTEST",
                expect.objectContaining({ lastChar: "X" })
            );
        });
    });

    // ============= EAN Addon Tests =============
    describe("EAN addon functionality", () => {
        it("supports EAN-5 addon format", () => {
            const mockBarcodeInstance = {
                EAN13: jest.fn().mockReturnThis(),
                blank: jest.fn().mockReturnThis(),
                EAN5: jest.fn().mockReturnThis(),
                render: jest.fn()
            };

            mockJsBarcode.mockReturnValue(mockBarcodeInstance);

            const props = createBarcodeProps({
                codeFormat: "Custom" as CodeFormatEnum,
                customCodeFormat: "EAN13" as CustomCodeFormatEnum,
                addonValue: { value: "12345", status: "available" } as any,
                addonFormat: "EAN5" as any,
                addonSpacing: 25,
                codeValue: { value: "1234567890128", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(mockJsBarcode).toHaveBeenCalled();
            expect(mockBarcodeInstance.EAN13).toHaveBeenCalledWith("1234567890128", expect.any(Object));
            expect(mockBarcodeInstance.blank).toHaveBeenCalledWith(25);
            expect(mockBarcodeInstance.EAN5).toHaveBeenCalledWith("12345", expect.any(Object));
            expect(mockBarcodeInstance.render).toHaveBeenCalled();
        });

        it("supports EAN-2 addon format", () => {
            const mockBarcodeInstance = {
                EAN13: jest.fn().mockReturnThis(),
                blank: jest.fn().mockReturnThis(),
                EAN2: jest.fn().mockReturnThis(),
                render: jest.fn()
            };

            mockJsBarcode.mockReturnValue(mockBarcodeInstance);

            const props = createBarcodeProps({
                codeFormat: "Custom" as CodeFormatEnum,
                customCodeFormat: "EAN13" as CustomCodeFormatEnum,
                addonValue: { value: "12", status: "available" } as any,
                addonFormat: "EAN2" as any,
                codeValue: { value: "1234567890128", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(mockJsBarcode).toHaveBeenCalled();
            expect(mockBarcodeInstance.EAN13).toHaveBeenCalled();
            expect(mockBarcodeInstance.EAN2).toHaveBeenCalledWith("12", expect.any(Object));
        });

        it("does not apply addon when addonFormat is None", () => {
            const props = createBarcodeProps({
                codeFormat: "Custom" as CodeFormatEnum,
                customCodeFormat: "EAN13" as CustomCodeFormatEnum,
                addonValue: { value: "12345", status: "available" } as any,
                addonFormat: "None" as any,
                codeValue: { value: "1234567890128", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(mockJsBarcode).toHaveBeenCalledWith(expect.any(Object), "1234567890128", expect.any(Object));
        });

        it("applies custom addon spacing", () => {
            const mockBarcodeInstance = {
                EAN13: jest.fn().mockReturnThis(),
                blank: jest.fn().mockReturnThis(),
                EAN5: jest.fn().mockReturnThis(),
                render: jest.fn()
            };

            mockJsBarcode.mockReturnValue(mockBarcodeInstance);

            const props = createBarcodeProps({
                codeFormat: "Custom" as CodeFormatEnum,
                customCodeFormat: "EAN13" as CustomCodeFormatEnum,
                addonValue: { value: "12345", status: "available" } as any,
                addonFormat: "EAN5" as any,
                addonSpacing: 40,
                codeValue: { value: "1234567890128", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(mockBarcodeInstance.blank).toHaveBeenCalledWith(40);
        });
    });

    // ============= Error Handling Tests =============
    describe("error handling", () => {
        it("renders error message when JsBarcode throws", () => {
            mockJsBarcode.mockImplementation(() => {
                throw new Error("Invalid barcode value");
            });

            const props = createBarcodeProps({
                codeFormat: "CODE128" as CodeFormatEnum,
                codeValue: { value: "INVALID", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(screen.getByText(/Unable to generate barcode/)).toBeInTheDocument();
            expect(screen.getByRole("alert")).toBeInTheDocument();
        });

        it("renders alert role for error message", () => {
            mockJsBarcode.mockImplementation(() => {
                throw new Error("Format error");
            });

            const props = createBarcodeProps({
                codeFormat: "CODE128" as CodeFormatEnum,
                codeValue: { value: "TEST", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            const alert = screen.getByRole("alert");
            expect(alert).toBeInTheDocument();
            expect(alert).toHaveClass("alert-danger");
        });

        it("clears error when valid barcode value is provided after error", () => {
            mockJsBarcode.mockImplementation(() => {
                throw new Error("Initial error");
            });

            const props = createBarcodeProps({
                codeFormat: "CODE128" as CodeFormatEnum,
                codeValue: { value: "BAD", status: "available" } as any
            });

            const { unmount } = render(<BarcodeGenerator {...props} />);

            expect(screen.getByText(/Unable to generate barcode/)).toBeInTheDocument();

            // Clean up first render to avoid duplicate DOM
            unmount();

            // Mock now succeeds
            mockJsBarcode.mockReset();

            const goodProps = createBarcodeProps({
                codeFormat: "CODE128" as CodeFormatEnum,
                codeValue: { value: "GOOD", status: "available" } as any
            });

            render(<BarcodeGenerator {...goodProps} />);

            expect(screen.queryByText(/Unable to generate barcode/)).not.toBeInTheDocument();
        });
    });

    // ============= Accessibility Tests =============
    describe("accessibility", () => {
        it("renders QR code title as semantic element when provided", () => {
            const props = createBarcodeProps({
                qrTitle: "Invoice QR Code",
                codeValue: { value: "test", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            const title = screen.getByText("Invoice QR Code");
            expect(title).toBeInTheDocument();
            expect(title.tagName).toBe("H3");
        });

        it("does not render title when qrTitle is empty", () => {
            const props = createBarcodeProps({
                qrTitle: "",
                codeValue: { value: "test", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(screen.queryByRole("heading")).not.toBeInTheDocument();
        });

        it("download button has proper semantics", () => {
            const props = createBarcodeProps({
                allowDownload: true,
                downloadButtonCaption: { status: "available" as const, value: "Download Barcode" } as any,
                downloadButtonAriaLabel: {
                    status: "available" as const,
                    value: "Download current barcode as PNG"
                } as any,
                codeValue: { value: "test", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            const button = screen.getByRole("button");
            expect(button).toHaveAttribute("aria-label", "Download current barcode as PNG");
            expect(button).toHaveTextContent("Download Barcode");
        });

        it("download button is keyboard accessible", async () => {
            const mockDownloadCode = downloadCode as jest.Mock;

            const props = createBarcodeProps({
                allowDownload: true,
                downloadButtonCaption: { status: "available" as const, value: "Download" } as any,
                codeValue: { value: "test", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            const button = screen.getByRole("button");
            const user = userEvent.setup();

            await user.click(button);

            expect(mockDownloadCode).toHaveBeenCalled();
        });

        it("error messages have alert role for screen readers", () => {
            mockJsBarcode.mockImplementation(() => {
                throw new Error("Test error");
            });

            const props = createBarcodeProps({
                codeFormat: "CODE128" as CodeFormatEnum,
                codeValue: { value: "TEST", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(screen.getByRole("alert")).toBeInTheDocument();
        });

        it("barcode widget container is focusable when tabIndex is set", () => {
            const props = createBarcodeProps({
                tabIndex: 0,
                codeValue: { value: "test", status: "available" } as any
            });

            const { container } = render(<BarcodeGenerator {...props} />);
            const widget = container.firstChild as HTMLElement;

            expect(widget).toHaveAttribute("tabIndex", "0");
        });
    });

    // ============= Integration Tests =============
    describe("integration scenarios", () => {
        it("renders QR code with download, title, and image overlay", () => {
            const props = createBarcodeProps({
                allowDownload: true,
                qrTitle: "Secure QR",
                qrImage: true,
                qrImageSrc: createMockWebImage("available"),
                downloadButtonCaption: { status: "available" as const, value: "Save QR" } as any,
                codeValue: { value: "secure-data", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(screen.getByText("Secure QR")).toBeInTheDocument();
            expect(screen.getByText("Save QR")).toBeInTheDocument();
            expect(screen.getByTestId("qr-code")).toBeInTheDocument();
        });

        it("renders barcode with all advanced options enabled", () => {
            const mockBarcodeInstance = {
                render: jest.fn()
            };
            mockJsBarcode.mockReturnValue(mockBarcodeInstance);

            const props = createBarcodeProps({
                codeFormat: "CODE128" as CodeFormatEnum,
                displayValue: true,
                showAsCard: true,
                enableEan128: true,
                enableFlat: true,
                enableMod43: true,
                allowDownload: true,
                downloadButtonCaption: { status: "available" as const, value: "Export" } as any,
                codeWidth: 3,
                codeHeight: 250,
                codeMargin: 5,
                lastChar: "Z",
                codeValue: { value: "FULL_TEST", status: "available" } as any
            });

            render(<BarcodeGenerator {...props} />);

            expect(mockJsBarcode).toHaveBeenCalledWith(
                expect.any(Object),
                "FULL_TEST",
                expect.objectContaining({
                    displayValue: true,
                    ean128: true,
                    flat: true,
                    mod43: true,
                    width: 3,
                    height: 250,
                    margin: 5,
                    lastChar: "Z"
                })
            );
            expect(screen.getByText("Export")).toBeInTheDocument();
        });
    });
});
