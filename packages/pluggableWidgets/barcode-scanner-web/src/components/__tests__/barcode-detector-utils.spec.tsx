import "@testing-library/jest-dom";
import {
    isBarcodeDetectorSupported,
    createBarcodeDetectorOptions,
    createBarcodeDetector,
    getBarcodeDetectorSupportedFormats
} from "../barcode-detector-utils";

// Mock window.BarcodeDetector
const mockBarcodeDetector = {
    detect: jest.fn(),
    getSupportedFormats: jest.fn()
};

const mockBarcodeDetectorConstructor = jest.fn(() => mockBarcodeDetector);

describe("BarcodeDetector Utils", () => {
    const originalWindow = global.window;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        global.window = originalWindow;
    });

    describe("isBarcodeDetectorSupported", () => {
        it("should return true when BarcodeDetector is available", () => {
            (global as any).window = {
                BarcodeDetector: mockBarcodeDetectorConstructor
            };
            
            expect(isBarcodeDetectorSupported()).toBe(true);
        });

        it("should return false when BarcodeDetector is not available", () => {
            (global as any).window = {};
            
            expect(isBarcodeDetectorSupported()).toBe(false);
        });

        it("should return false when window is not available", () => {
            delete (global as any).window;
            
            expect(isBarcodeDetectorSupported()).toBe(false);
        });
    });

    describe("createBarcodeDetectorOptions", () => {
        it("should return empty options when useAllFormats is true", () => {
            const options = createBarcodeDetectorOptions(true);
            
            expect(options).toEqual({});
        });

        it("should return specific formats when useAllFormats is false", () => {
            const barcodeFormats = [
                { barcodeFormat: "QR_CODE" },
                { barcodeFormat: "CODE_128" }
            ];
            
            const options = createBarcodeDetectorOptions(false, barcodeFormats);
            
            expect(options.formats).toEqual(["qr_code", "code_128"]);
        });

        it("should return empty options when useAllFormats is false but no formats provided", () => {
            const options = createBarcodeDetectorOptions(false);
            
            expect(options).toEqual({});
        });
    });

    describe("createBarcodeDetector", () => {
        beforeEach(() => {
            (global as any).window = {
                BarcodeDetector: mockBarcodeDetectorConstructor
            };
        });

        it("should return null when BarcodeDetector is not supported", () => {
            delete (global as any).window.BarcodeDetector;
            
            const detector = createBarcodeDetector();
            
            expect(detector).toBeNull();
        });

        it("should create BarcodeDetector with options", () => {
            const options = { formats: ["qr_code"] };
            
            const detector = createBarcodeDetector(options);
            
            expect(detector).toBe(mockBarcodeDetector);
            expect(mockBarcodeDetectorConstructor).toHaveBeenCalledWith(options);
        });

        it("should handle constructor errors gracefully", () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            mockBarcodeDetectorConstructor.mockImplementationOnce(() => {
                throw new Error("Constructor failed");
            });
            
            const detector = createBarcodeDetector();
            
            expect(detector).toBeNull();
            expect(consoleSpy).toHaveBeenCalledWith("Failed to create BarcodeDetector:", expect.any(Error));
            
            consoleSpy.mockRestore();
        });
    });

    describe("getBarcodeDetectorSupportedFormats", () => {
        beforeEach(() => {
            (global as any).window = {
                BarcodeDetector: mockBarcodeDetectorConstructor
            };
        });

        it("should return supported formats", async () => {
            const supportedFormats = ["qr_code", "code_128", "ean_13"];
            mockBarcodeDetector.getSupportedFormats.mockResolvedValue(supportedFormats);
            
            const formats = await getBarcodeDetectorSupportedFormats();
            
            expect(formats).toEqual(supportedFormats);
        });

        it("should return empty array when BarcodeDetector is not supported", async () => {
            delete (global as any).window.BarcodeDetector;
            
            const formats = await getBarcodeDetectorSupportedFormats();
            
            expect(formats).toEqual([]);
        });

        it("should handle errors gracefully", async () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            mockBarcodeDetector.getSupportedFormats.mockRejectedValue(new Error("API failed"));
            
            const formats = await getBarcodeDetectorSupportedFormats();
            
            expect(formats).toEqual([]);
            expect(consoleSpy).toHaveBeenCalledWith("Failed to get BarcodeDetector supported formats:", expect.any(Error));
            
            consoleSpy.mockRestore();
        });
    });
});