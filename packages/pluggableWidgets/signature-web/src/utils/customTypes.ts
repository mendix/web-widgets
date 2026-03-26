import { PenTypeEnum, SignatureContainerProps } from "../../typings/SignatureProps";

export interface SignatureProps extends SignatureContainerProps {
    className: string;
    alertMessage?: string;
    gridCellWidth: number;
    gridCellHeight: number;
    gridBorderColor: string;
    gridBorderWidth: number;
    penType: PenTypeEnum;
    penColor: string;
    wrapperStyle?: object;
}
