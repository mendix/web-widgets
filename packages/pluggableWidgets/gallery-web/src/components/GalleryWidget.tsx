import { ReactElement } from "react";
import { GalleryFooter as Footer } from "./GalleryFooter";
import { GalleryFooterControls as FooterControls } from "./GalleryFooterControls";
import { GalleryHeader as Header } from "./GalleryHeader";
import { GalleryRoot as Root } from "./GalleryRoot";
import { GalleryTopBar as TopBar } from "./GalleryTopBar";

export function GalleryWidget(): ReactElement {
    return (
        <Root>
            <TopBar>
                <div className="widget-gallery-top-bar-controls"></div>
            </TopBar>
            <Header />
            <Footer>
                <FooterControls />
            </Footer>
        </Root>
    );
}
