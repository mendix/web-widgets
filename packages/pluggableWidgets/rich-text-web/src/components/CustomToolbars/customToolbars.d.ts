import Quill from "quill";

export type ToolbarContextType = {
    presetValue: number;
};

export type ToolbarConsumerContext = {
    presetValue?: number;
};

export type ToolbarButtonProps = {
    className?: string;
    onClick?: () => void;
    value?: any;
    title: string;
} & ToolbarConsumerContext &
    PropsWithChildren;

export type CustomToolbarProps = {
    quill: Quill;
};
