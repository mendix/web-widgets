import { ReactElement } from "react";
import { DownloadIcon } from "./icons/DownloadIcon";

interface DownloadButtonProps {
    onClick: () => void;
    ariaLabel?: string;
    caption?: string;
}

export function DownloadButton({ onClick, ariaLabel, caption }: DownloadButtonProps): ReactElement {
    return (
        <button type="button" className="barcode-generator-download-button" aria-label={ariaLabel} onClick={onClick}>
            <DownloadIcon /> {caption}
        </button>
    );
}
