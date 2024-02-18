export function deletePlugin(): void {
    delete (window as any)["com.mendix.widgets.web.plugin.externalEvents"];
}
