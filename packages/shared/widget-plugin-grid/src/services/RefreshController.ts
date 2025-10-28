import { autoEffect } from "@mendix/widget-plugin-mobx-kit/autoEffect";
import { SetupComponent, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";

interface QueryService {
    datasource: unknown;
    backgroundRefresh(): void;
}

export class RefreshController implements SetupComponent {
    constructor(
        host: SetupComponentHost,
        private readonly query: QueryService,
        private readonly delay = 0
    ) {
        host.add(this);
        this.delay = Math.max(delay, 0);
    }

    setup(): (() => void) | void {
        if (this.delay <= 0) {
            return;
        }
        // Set timer every time we got new ds ref value
        // Avoid using any other reactive dependencies other then ds
        return autoEffect(() => {
            return this.scheduleRefresh(this.query.datasource, this.query, this.delay);
        });
    }

    private scheduleRefresh(
        /** ref is used only as placeholder. */
        _ref: unknown,
        helper: QueryService,
        delay: number
    ): () => void {
        const timerId = setTimeout(() => {
            helper.backgroundRefresh();
        }, delay);
        return () => {
            clearTimeout(timerId);
        };
    }
}
