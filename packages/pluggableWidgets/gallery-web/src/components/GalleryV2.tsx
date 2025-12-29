import { ReactElement } from "react";
import { GalleryHeader as Header } from "./GalleryHeader";
import { GalleryRoot as Root } from "./GalleryRoot";
import { GalleryTopBar as TopBar } from "./GalleryTopBar";

export function Gallery(): ReactElement {
    return (
        <Root>
            <TopBar>
                <div className="widget-gallery-top-bar-controls"></div>
            </TopBar>
            <Header />
        </Root>
    );
}
