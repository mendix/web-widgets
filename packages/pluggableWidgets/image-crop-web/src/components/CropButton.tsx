import classNames from "classnames";
import { ReactElement } from "react";

interface CropButtonProps {
    caption: string;
    disabled: boolean;
    onClick: () => void;
}

export function CropButton({ caption, disabled, onClick }: CropButtonProps): ReactElement {
    return (
        <button
            type="button"
            className={classNames("btn", "btn-primary", "widget-image-crop__button")}
            disabled={disabled}
            onClick={onClick}
        >
            {caption}
        </button>
    );
}
