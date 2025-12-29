import { ReactElement } from "react";
import { GalleryFooter } from "./GalleryFooter";
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
            <GalleryFooter>
                <div className="widget-gallery-footer-controls">
                    {showBottomSelectionCounter && <div className="widget-gallery-fc-start">{selectionCounter}</div>}

                    <div className="widget-gallery-fc-end">
                        {showBottomPagination && pagination}
                        {props.paginationType === "loadMore" &&
                            (props.preview ? (
                                <LoadMorePreview>{loadMoreButtonCaption}</LoadMorePreview>
                            ) : (
                                <LoadMore>{loadMoreButtonCaption}</LoadMore>
                            ))}
                    </div>
                </div>
            </GalleryFooter>
        </Root>
    );
}
