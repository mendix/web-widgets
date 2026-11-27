/* global window */
// Records every props object a widget receives on `window.__probes[props.name]`, so a test can drive
// the props and observe the next ones. The same file is used in the harness host and, injected into
// a widget bundle by `runtime/make-probe-mpk.mjs`, in a real Mendix app.

function ids(items) {
    return items ? items.map(item => item.id) : undefined;
}

function plain(value) {
    if (value === undefined || value === null) {
        return value;
    }
    if (value instanceof Date) {
        return { date: value.toISOString() };
    }
    if (typeof value === "object" && typeof value.toFixed === "function") {
        return { big: value.toString() };
    }
    if (Array.isArray(value)) {
        return value.map(plain);
    }
    if (typeof value === "object") {
        return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, plain(v)]));
    }
    return value;
}

function editable(value) {
    return value
        ? {
              status: value.status,
              value: plain(value.value),
              displayValue: value.displayValue,
              readOnly: value.readOnly,
              validation: value.validation
          }
        : undefined;
}

function snapshot(props) {
    const ds = props.datasource;
    const selection = props.itemSelection;
    return {
        at: Date.now(),
        datasource: ds && {
            status: ds.status,
            offset: ds.offset,
            limit: ds.limit,
            totalCount: ds.totalCount,
            hasMoreItems: ds.hasMoreItems,
            ids: ids(ds.items),
            sortOrder: plain(ds.sortOrder),
            hasFilter: ds.filter !== undefined
        },
        selection: selection && {
            type: selection.type,
            ids: selection.type === "Multi" ? ids(selection.selection) : selection.selection?.id
        },
        configurationAttribute: editable(props.configurationAttribute)
    };
}

export function recordProbe(props, builders) {
    const probes = (window.__probes ??= {});
    const probe = (probes[props.name] ??= { snapshots: [], builders });
    if (probe.props !== props) {
        probe.props = props;
        probe.snapshots.push(snapshot(props));
    }
}
