import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/main";
import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";
import { action, makeObservable, observable } from "mobx";

export class ResizeController implements ReactiveController {
    width = 0;
    height = 0;
    private cleanup: undefined | (() => void) = undefined;

    constructor(host: ReactiveControllerHost) {
        host.addController(this);

        makeObservable(this, {
            width: observable,
            height: observable,
            setSize: action.bound
        });
    }

    setTarget = (target: HTMLElement | null): void => {
        if (target === null) {
            this.cleanup?.();
        } else {
            const [setSizeDebounced, abort] = debounce(this.setSize, 100);
            const resizeObserver = new ResizeObserver(entries => {
                const { width, height } = entries[0].contentRect;
                setSizeDebounced(width, height);
            });

            resizeObserver.observe(target);

            this.cleanup = () => {
                abort();
                resizeObserver.disconnect();
            };
        }
    };

    setup(): () => void {
        return () => this.cleanup?.();
    }

    setSize(width: number, height: number): void {
        this.width = width;
        this.height = height;
    }
}
