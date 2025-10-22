import { disposeBatch } from "./disposeBatch";
import { ReactiveController, ReactiveControllerHost, SetupLifecycle } from "./reactive-controller";

export abstract class BaseSetupLifecycleHost implements ReactiveControllerHost, SetupLifecycle {
    private controllers: Set<ReactiveController> = new Set();
    private nodes: Set<SetupLifecycle> = new Set();
    private isSetupCalled: boolean = false;

    addController(controller: ReactiveController): void {
        this.controllers.add(controller);
    }

    removeController(controller: ReactiveController): void {
        this.controllers.delete(controller);
    }

    addNode(node: SetupLifecycle): void {
        this.nodes.add(node);
    }

    removeNode(node: SetupLifecycle): void {
        this.nodes.delete(node);
    }

    setup(): () => void {
        if (this.isSetupCalled) {
            throw new Error("setup method has already been called.");
        }
        this.isSetupCalled = true;

        const [add, disposeAll] = disposeBatch();
        for (const controller of this.controllers) {
            const cleanup = controller.setup?.();
            if (cleanup) {
                add(cleanup);
            }
        }
        for (const node of this.nodes) {
            const cleanup = node.setup?.();
            if (cleanup) add(cleanup);
        }
        return disposeAll;
    }
}
