import { SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { SetupHost } from "@mendix/widget-plugin-mobx-kit/SetupHost";

/** Runs a reaction now, or after React commits the render in progress. */
export interface RenderPhaseScheduler {
    schedule(run: () => void): void;
}

export type ComboboxSetupHost = SetupComponentHost & RenderPhaseScheduler;

/**
 * Host for the parts of the core that own a lifecycle (`setup()` on mount, disposer on unmount).
 *
 * Props reach the gate during render, so that render reads them. The reactions that write to
 * Mendix values pass `schedule` as their MobX scheduler: a run triggered while props are pushed
 * waits for `flush`, which the widget calls once React commits, and reads the state of that moment.
 */
export class ComboboxSetupService extends SetupHost implements RenderPhaseScheduler {
    private pushing = false;
    private readonly pending = new Set<() => void>();

    get isPushingProps(): boolean {
        return this.pushing;
    }

    pushProps(push: () => void): void {
        this.pushing = true;
        try {
            push();
        } finally {
            this.pushing = false;
        }
    }

    readonly schedule = (run: () => void): void => {
        if (this.pushing) {
            this.pending.add(run);
        } else {
            run();
        }
    };

    flush(): void {
        const runs = [...this.pending];
        this.pending.clear();
        for (const run of runs) {
            run();
        }
    }
}
