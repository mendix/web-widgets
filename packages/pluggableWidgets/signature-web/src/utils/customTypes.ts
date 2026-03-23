import { PenTypeEnum, SignatureContainerProps } from "../../typings/SignatureProps";

export interface SignatureProps extends Omit<SignatureContainerProps, "onSignEndAction"> {
    className: string;
    alertMessage?: string;
    clearSignature: boolean;
    showGrid: boolean;
    gridCellWidth: number;
    gridCellHeight: number;
    gridBorderColor: string;
    gridBorderWidth: number;
    penType: PenTypeEnum;
    penColor: string;
    onSignEndAction?: (imageUrl?: string) => void;
    wrapperStyle?: object;
    readOnly: boolean;
}
