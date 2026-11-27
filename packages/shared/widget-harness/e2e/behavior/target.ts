import { expect, Page, test as base } from "@playwright/test";

export type PageName = "home" | "multi-selection" | "single-selection";

/** Everything a spec can do in the page; identical on the harness and in a real Mendix app. */
function installHelpers(): void {
    const w = window as any;
    const probe = (name: string): any => {
        const p = w.__probes?.[name];
        if (!p) {
            throw new Error(`No probe for "${name}"`);
        }
        return p;
    };
    const isRuntime = (): boolean => typeof w.mx === "object" && typeof w.mx.data?.commit === "function";
    const mxCall = (fn: string, args: Record<string, unknown>): Promise<any> =>
        new Promise((resolve, reject) => w.mx.data[fn]({ ...args, callback: resolve, error: reject }));

    w.__t = {
        probe,
        count: (name: string) => probe(name).snapshots.length,
        since: (name: string, n: number) => probe(name).snapshots.slice(n),
        last: (name: string) => probe(name).snapshots.at(-1),
        col: (name: string, header: string) => {
            const c = probe(name).props.columns.find((x: any) => x.header?.value === header);
            if (!c) {
                throw new Error(`No column "${header}" in ${name}`);
            }
            return c.attribute;
        },
        values: (name: string, header: string) => {
            const props = probe(name).props;
            const attr = w.__t.col(name, header);
            return (props.datasource.items ?? []).map((item: any) => attr.get(item).displayValue);
        },
        run: (name: string, src: string, arg: unknown) => {
            const p = probe(name);
            const ctx = { props: p.props, b: p.builders, col: (header: string) => w.__t.col(name, header) };
            // eslint-disable-next-line no-new-func -- specs pass the action as source so it runs in the page
            return new Function("ctx", "arg", `return (${src})(ctx, arg);`)(ctx, arg);
        },
        update: async (id: string, attr: string, value: string) => {
            if (isRuntime()) {
                const obj = await mxCall("get", { guid: id });
                obj.set(attr, value);
                await mxCall("commit", { mxobj: obj });
            } else {
                w.harness.harness.store.update(id, { [attr]: value });
            }
        },
        create: async (entity: string, values: Record<string, string>) => {
            if (isRuntime()) {
                const obj = await mxCall("create", { entity });
                Object.entries(values).forEach(([k, v]) => obj.set(k, v));
                await mxCall("commit", { mxobj: obj });
                return obj.getGuid();
            }
            return w.harness.harness.store.insert(entity, values);
        },
        remove: async (id: string) => {
            if (isRuntime()) {
                await mxCall("remove", { guid: id });
            } else {
                w.harness.harness.store.remove(id);
            }
        }
    };
}

export interface Target {
    readonly name: "harness" | "runtime";
    open(page: PageName): Promise<void>;
    /** Delays every data request by `ms` (0 restores normal speed). */
    slowNetwork(ms: number): Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Playwright's "no test-scoped fixtures" type
export const test = base.extend<{}, { target: Target; shared: Page }>({
    shared: [
        async ({ browser }, use) => {
            // One page for the whole file: a real app counts every browser context as a session.
            const page = await browser.newPage();
            page.on("pageerror", error => console.log(`[page error] ${error.message}`));
            page.on("requestfailed", r => console.log(`[request failed] ${r.url()} ${r.failure()?.errorText}`));
            await page.addInitScript(installHelpers);
            await use(page);
            await page.close();
        },
        { scope: "worker" }
    ],
    target: [
        async ({ shared }, use, workerInfo) => {
            const name = workerInfo.project.name === "runtime" ? "runtime" : "harness";
            const baseURL = workerInfo.project.use.baseURL!;
            const target: Target = {
                name,
                async open(pageName) {
                    const path =
                        name === "runtime"
                            ? pageName === "home"
                                ? "/"
                                : `/p/${pageName}`
                            : `/?scenario=test-project&page=${pageName}`;
                    await shared.unrouteAll();
                    await shared.goto(new URL(path, baseURL).toString());
                    await shared.waitForFunction(() => {
                        const probes = Object.values((window as any).__probes ?? {}) as any[];
                        return probes.length > 0 && probes.every(p => p.props.datasource.status === "available");
                    });
                },
                async slowNetwork(ms) {
                    if (name === "runtime") {
                        await shared.unrouteAll();
                        if (ms > 0) {
                            await shared.route("**/xas/**", async route => {
                                await new Promise(resolve => setTimeout(resolve, ms));
                                await route.continue();
                            });
                        }
                    } else {
                        await shared.evaluate(delay => {
                            Object.values((window as any).harness.lists).forEach((list: any) => list.setDelay(delay));
                        }, ms || 20);
                    }
                }
            };
            await use(target);
        },
        { scope: "worker" }
    ]
});

export { expect };

/** Runs `fn(ctx, arg)` in the page against the latest props of `grid`; ctx has `props`, `b` (filter builders), `col(header)`. */
export function act<A, R = unknown>(
    page: Page,
    grid: string,
    fn: (ctx: { props: any; b: any; col: (header: string) => any }, arg: A) => R,
    arg?: A
): Promise<Awaited<R>> {
    return page.evaluate(([g, src, a]) => (window as any).__t.run(g, src, a), [grid, fn.toString(), arg] as const);
}

export function values(page: Page, grid: string, header: string): Promise<string[]> {
    return page.evaluate(([g, h]) => (window as any).__t.values(g, h), [grid, header] as const);
}

export function last(page: Page, grid: string): Promise<any> {
    return page.evaluate(g => (window as any).__t.last(g), grid);
}

export function count(page: Page, grid: string): Promise<number> {
    return page.evaluate(g => (window as any).__t.count(g), grid);
}

export function since(page: Page, grid: string, n: number): Promise<any[]> {
    return page.evaluate(([g, i]) => (window as any).__t.since(g, i), [grid, n] as const);
}

export function itemId(page: Page, grid: string, index: number): Promise<string> {
    return page.evaluate(([g, i]) => (window as any).__t.probe(g).props.datasource.items[i].id, [grid, index] as const);
}

export function quiet(ms = 600): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const expectValues = (page: Page, grid: string, header: string): ReturnType<typeof expect.poll> =>
    expect.poll(() => values(page, grid, header));
