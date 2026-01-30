import { getColumnAndRowBasedOnIndex, PositionInGrid } from "@mendix/widget-plugin-grid/selection";
import { ComputedAtom, SetupComponent, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { action, computed, makeAutoObservable } from "mobx";
import { GalleryContainerProps } from "../../../typings/GalleryProps";

type Breakpoint = "desktop" | "tablet" | "phone";

export class LayoutService implements SetupComponent {
    private width: number;
    private resizeListener: ((event: UIEvent) => void) | null = null;

    constructor(
        host: SetupComponentHost,
        private config: Pick<GalleryContainerProps, "desktopItems" | "phoneItems" | "tabletItems">,
        private itemCount: ComputedAtom<number>
    ) {
        host.add(this);
        this.width = window.innerWidth;

        makeAutoObservable(this, {
            breakpoint: computed,
            numberOfColumns: computed,
            numberOfRows: computed,
            getPositionFn: computed,
            setWidth: action,
            setup: false
        });
    }

    setWidth(width: number): void {
        this.width = width;
    }

    setup(): () => void {
        this.resizeListener = (event: UIEvent): void => {
            this.setWidth((event.target as Window).innerWidth);
        };

        window.addEventListener("resize", this.resizeListener);

        return () => {
            if (this.resizeListener) {
                window.removeEventListener("resize", this.resizeListener);
                this.resizeListener = null;
            }
        };
    }

    private mapBreakpoint(width: number): Breakpoint {
        if (width < 768) {
            return "phone";
        }

        if (width >= 768 && width < 992) {
            return "tablet";
        }

        return "desktop";
    }

    private mapNumberOfColumns(breakpoint: Breakpoint): number {
        return this.config[`${breakpoint}Items`];
    }

    get breakpoint(): Breakpoint {
        return this.mapBreakpoint(this.width);
    }

    get numberOfColumns(): number {
        const cols = this.mapNumberOfColumns(this.breakpoint);
        return Math.min(cols, this.itemCount.get());
    }

    get numberOfRows(): number {
        return Math.ceil(this.itemCount.get() / this.numberOfColumns);
    }

    get getPositionFn(): (itemIndex: number) => PositionInGrid {
        const numberOfColumns = this.numberOfColumns;
        const total = this.itemCount.get();
        const fn = (index: number): PositionInGrid => {
            return getColumnAndRowBasedOnIndex(numberOfColumns, total, index);
        };

        return fn;
    }
}
