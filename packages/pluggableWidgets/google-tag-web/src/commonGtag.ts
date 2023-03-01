if (document.mxGtag === undefined) {
    // init data layer
    window.dataLayer = window.dataLayer || [];
    const gtagMethod: (...args: any[]) => void = function () {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer.push(arguments);
    };

    let isGtagIncluded = false;
    document.mxGtag = {
        getGtag() {
            return gtagMethod;
        },
        ensureGtagIncluded(tagId: string): boolean {
            if (!isGtagIncluded) {
                // include script
                const scriptTag = document.createElement("script");
                scriptTag.type = "text/javascript";
                scriptTag.async = true;
                scriptTag.src = `https://www.googletagmanager.com/gtag/js?id=${tagId}`;
                document.querySelector("head")?.appendChild(scriptTag);

                // setup timestamp
                gtagMethod("js", new Date());

                isGtagIncluded = true;

                return true;
            }

            return false;
        }
    };
}

export default document.mxGtag;
