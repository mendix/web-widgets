import {
    datamatrix,
    datamatrixrectangular,
    drawingSVG,
    gs1datamatrix,
    gs1datamatrixrectangular
} from "@bwip-js/browser";
import { ReactElement, useMemo, useRef } from "react";
import { DownloadButton } from "./DownloadButton";
import { DataMatrixTypeConfig } from "../config/Barcode.config";
import { validateBarcodeValue, validateGs1DataMatrixValue } from "../config/validation";
import { downloadCode } from "../utils/download-code";
import { printError } from "../utils/helpers";

interface DataMatrixRendererProps {
    config: DataMatrixTypeConfig;
}

/** Selects the bwip-js encoder for the requested GS1 mode and symbol shape. */
function encodeDataMatrix(config: DataMatrixTypeConfig): string {
    const opts = {
        text: config.codeValue,
        // bwip-js scale is in module units; map the pixel size onto a reasonable scale.
        scale: Math.max(1, Math.round(config.size / 32)),
        paddingwidth: config.margin,
        paddingheight: config.margin,
        // GS1 AI syntax uses parentheses; parse must be on for the human-readable form.
        parse: config.gs1Mode
    } as const;

    if (config.gs1Mode) {
        return config.shape === "rectangle"
            ? gs1datamatrixrectangular({ ...opts, bcid: "gs1datamatrixrectangular" }, drawingSVG())
            : gs1datamatrix({ ...opts, bcid: "gs1datamatrix" }, drawingSVG());
    }

    return config.shape === "rectangle"
        ? datamatrixrectangular({ ...opts, bcid: "datamatrixrectangular" }, drawingSVG())
        : datamatrix({ ...opts, bcid: "datamatrix" }, drawingSVG());
}

/** bwip-js SVGs only carry a viewBox, no width/height attributes; derive pixel dimensions from it. */
function getSvgPixelSize(svg: string, size: number): { width: number; height: number } {
    const match = svg.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/);
    if (!match) {
        return { width: size, height: size };
    }
    const [viewBoxWidth, viewBoxHeight] = [parseFloat(match[1]), parseFloat(match[2])];
    return viewBoxWidth >= viewBoxHeight
        ? { width: size, height: (size * viewBoxHeight) / viewBoxWidth }
        : { width: (size * viewBoxWidth) / viewBoxHeight, height: size };
}

export function DataMatrixRenderer({ config }: DataMatrixRendererProps): ReactElement {
    const containerRef = useRef<HTMLDivElement>(null);
    const { codeValue, downloadButton, size, gs1Mode } = config;
    const buttonPosition = downloadButton?.buttonPosition ?? "bottom";

    const { svg, error } = useMemo<{ svg: string | null; error: boolean }>(() => {
        if (!codeValue) {
            return { svg: null, error: false };
        }

        const baseValidation = validateBarcodeValue("DataMatrix", codeValue);
        if (!baseValidation.valid) {
            printError(`Validation failed for Data Matrix: ${baseValidation.message}`, config.logLevel);
            return { svg: null, error: true };
        }

        if (gs1Mode) {
            const gs1Validation = validateGs1DataMatrixValue(codeValue);
            if (!gs1Validation.valid) {
                printError(`GS1 Data Matrix validation failed: ${gs1Validation.message}`, config.logLevel);
                return { svg: null, error: true };
            }
        }

        try {
            return { svg: encodeDataMatrix(config), error: false };
        } catch (e) {
            const message = e instanceof Error ? e.message : "Error generating Data Matrix";
            printError(`Rendering failed: ${message} \nValue: "${codeValue}"`, config.logLevel);
            return { svg: null, error: true };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [codeValue, size, gs1Mode, config.shape, config.margin, config.logLevel]);

    if (error || !svg) {
        return (
            <div className="barcode-renderer">
                {error && config.logLevel !== "None" && (
                    <div className="alert alert-danger" role="alert">
                        <strong>Unable to generate Data Matrix.</strong> Please check the value and format
                        configuration.
                    </div>
                )}
            </div>
        );
    }

    const getSvgElement = (): SVGSVGElement | null => containerRef.current?.querySelector("svg") ?? null;

    const button = downloadButton && (
        <DownloadButton
            onClick={() => downloadCode({ current: getSvgElement() }, config, downloadButton.fileName)}
            ariaLabel={downloadButton.label}
            caption={downloadButton.caption}
        />
    );

    const { width, height } = getSvgPixelSize(svg, size);

    return (
        <div className="barcode-renderer datamatrix-renderer">
            {buttonPosition === "top" && button}
            <div
                ref={containerRef}
                className="datamatrix-svg"
                style={{ width, height }}
                dangerouslySetInnerHTML={{ __html: svg }}
            />
            {buttonPosition === "bottom" && button}
        </div>
    );
}
