import { ReactElement } from "react";
import { GalleryContent as Content } from "./GalleryContent";
import { GalleryFooter as Footer } from "./GalleryFooter";
import { GalleryFooterControls as FooterControls } from "./GalleryFooterControls";
import { GalleryHeader as Header } from "./GalleryHeader";
import { GalleryRoot as Root } from "./GalleryRoot";
import { GalleryTobBarControls as TopBarControls } from "./GalleryTobBarControls";
import { GalleryTopBar as TopBar } from "./GalleryTopBar";

export function GalleryWidget(): ReactElement {
    return (
        <Root>
            <TopBar>
                <TopBarControls />
            </TopBar>
            <Header />
            <Content></Content>
            <Footer>
                <FooterControls />
            </Footer>
        </Root>
    );
}
