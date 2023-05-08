const PLUGIN_PATH_EXTERNAL_EVENTS = "com.mendix.widgets.web.plugin.externalEvents" as const;

declare global {
    interface Window {
        [PLUGIN_PATH_EXTERNAL_EVENTS]?: 42;
    }
}

function pluginSetup(): 42 {
    if (Object.prototype.hasOwnProperty.call(window, PLUGIN_PATH_EXTERNAL_EVENTS)) {
        throw new Error("Widget plugin external events: plugin already initialized!");
    }

    return 42 as const;
}

function pluginRequire(): 42 {
    let plugin = window[PLUGIN_PATH_EXTERNAL_EVENTS];
    if (plugin === undefined) {
        plugin = window[PLUGIN_PATH_EXTERNAL_EVENTS] = pluginSetup();
    }

    return plugin;
}

export { pluginRequire };
