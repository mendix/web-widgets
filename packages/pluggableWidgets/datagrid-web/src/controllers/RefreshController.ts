import { autoEffect } from "@mendix/widget-plugin-mobx-kit/autoEffect";
import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/main";

interface QueryHelper {
    refresh(): void;
}

interface ObservableAtom {
    get(): QueryHelper;
}

type RefreshControllerSpec = { delay: number; query: ObservableAtom };

export class RefreshController implements ReactiveController {
    private query: ObservableAtom;
    private readonly delay: number;

    constructor(host: ReactiveControllerHost, spec: RefreshControllerSpec) {
        host.addController(this);
        this.query = spec.query;
        this.delay = Math.max(spec.delay, 0);
    }

    setup(): (() => void) | void {
        if (this.delay <= 0) {
            return;
        }
        // Set timer every time we got new ds ref value
        // Avoid using any other reactive dependencies other then ds
        return autoEffect(() => {
            return this.scheduleRefresh(this.query.get(), this.delay);
        });
    }

    private scheduleRefresh(helper: QueryHelper, delay: number): () => void {
        const timerId = setTimeout(() => {
            helper.refresh();
        }, delay);
        return () => {
            clearTimeout(timerId);
        };
    }
}
