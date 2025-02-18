export interface CorrectBound {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width?: number;
    height?: number;
}

export interface Props {
    [propName: string]: string;
}

export interface Range {
    index: number;
    length: number;
}
