import classNames from "classnames";
import { enableStaticRendering } from "mobx-react-lite";
enableStaticRendering(true);

import { createContext, createElement, PropsWithChildren, ReactElement, ReactNode, useContext } from "react";
import { GalleryPreviewProps } from "../typings/GalleryProps";
import "./ui/GalleryPreview.scss";

const PropsCtx = createContext<GalleryPreviewProps>({} as GalleryPreviewProps);

function useProps(): GalleryPreviewProps {
    return useContext(PropsCtx);
}

function Preview(props: GalleryPreviewProps): ReactElement {
    return (
        <PropsCtx.Provider value={props}>
            <Root>
                <div className="widget-gallery-top-bar">
                    <TopControls />
                    <Header />
                    <Content />
                </div>
            </Root>
        </PropsCtx.Provider>
    );
}

const Root = ({ children }: PropsWithChildren): ReactNode => {
    const props = useProps();
    return (
        <div className={classNames("widget-gallery", props.className)} style={props.styleObject}>
            {children}
        </div>
    );
};

const TopControls = (): ReactNode => {
    const props = useProps();
    if (props.pagingPosition !== "top") {
        return null;
    }

    return (
        <div className="widget-gallery-top-bar-controls">
            <div className="widget-gallery-tb-end">
                <div>Pagination</div>
            </div>
        </div>
    );
};

const Header = (): ReactNode => {
    const props = useProps();

    return (
        <section className="widget-gallery-header widget-gallery-filter">
            <props.filtersPlaceholder.renderer>
                <div />
            </props.filtersPlaceholder.renderer>
        </section>
    );
};

const Item = ({ className }: { className?: string }): ReactNode => {
    const props = useProps();
    return (
        <props.content.renderer>
            <div className={classNames("widget-gallery-item", className)} />
        </props.content.renderer>
    );
};

const Content = (): ReactNode => {
    const props = useProps();
    const { desktopItems: lg, tabletItems: md, phoneItems: sm } = props;
    const rows = 3;
    const lgCount = (lg ?? 0) * rows - 1;
    const mdCount = (md ?? 0) * rows - 1;
    const smCount = (sm ?? 0) * rows - 1;

    return (
        <div className="widget-gallery-content">
            <div
                className={classNames("widget-gallery-items", {
                    [`widget-gallery-sm-${sm}`]: sm,
                    [`widget-gallery-md-${md}`]: md,
                    [`widget-gallery-lg-${lg}`]: lg
                })}
            >
                <Item key="selectable_DO_NOE_REMOVE!_ALWAYS_RENDER!" />
                {Array.from({ length: lgCount }).map((_, index) => (
                    <Item key={index} className="visible-md visible-lg" />
                ))}
                {Array.from({ length: mdCount }).map((_, index) => (
                    <Item key={index} className="visible-sm" />
                ))}
                {Array.from({ length: smCount }).map((_, index) => (
                    <Item key={index} className="visible-xs" />
                ))}
            </div>
        </div>
    );
};

export function preview(props: GalleryPreviewProps): ReactElement {
    return createElement(Preview, props);
}
