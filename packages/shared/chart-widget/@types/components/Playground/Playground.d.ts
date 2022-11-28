import { Dispatch, ReactElement, ReactNode, SetStateAction } from "react";
import { ChartProps } from "../Chart";
import "../../ui/Playground.scss";
interface PlaygroundProps {
    children: ReactNode;
    renderPanels: ReactNode;
    renderSidebarHeaderTools: ReactNode;
}
export declare const Playground: {
    Wrapper: ({ children, renderPanels, renderSidebarHeaderTools }: PlaygroundProps) => ReactElement;
    Panel: ({
        className,
        heading,
        headingClassName,
        children
    }: import("./Sidebar").SidebarPanelProps) => ReactElement<any, string | import("react").JSXElementConstructor<any>>;
    SidebarHeaderTools: ({
        className,
        children
    }: import("./Sidebar").SidebarHeaderToolsProps) => ReactElement<
        any,
        string | import("react").JSXElementConstructor<any>
    >;
    Select: ({
        onChange,
        options
    }: import("./Sidebar").SelectProps) => ReactElement<any, string | import("react").JSXElementConstructor<any>>;
};
interface ChartsPlaygroundState {
    data: ChartProps["data"];
    customLayout?: string;
    customConfig?: string;
    customSeries?: string;
}
declare type PlaygroundView = "layout" | "config" | string;
export declare const useChartsPlaygroundState: ({ data, customConfig, customLayout }: ChartsPlaygroundState) => {
    activeEditableCode: string;
    activeView: PlaygroundView;
    changeActiveView: Dispatch<SetStateAction<PlaygroundView>>;
    changeEditableCode: (value: string) => void;
    changeEditableCodeIsValid: (isValid: boolean) => void;
    editedConfig: NonNullable<ChartProps["customConfig"]>;
    editedData: ChartProps["data"];
    editedLayout: NonNullable<ChartProps["customLayout"]>;
};
export {};
//# sourceMappingURL=Playground.d.ts.map
