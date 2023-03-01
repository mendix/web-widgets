interface Window {
    dojoConfig: {
        cacheBust: string;
    };
    dojo: typeof dojo & { locale: string };
    __REDUX_DEVTOOLS_EXTENSION__?: () => any;
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: (applyMiddleware: any) => any;
}
