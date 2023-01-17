interface DocumentMxGtag extends Document {
    mxGtag?: {
        ensureGtagIncluded: (tagId: string) => void;
        getGtag: () => (...args: any[]) => void;
    };
}

if ((document as DocumentMxGtag).mxGtag === undefined) {
    // init data layer
    (window as any).dataLayer = (window as any).dataLayer || [];
    const gtagMethod = function () {
        // eslint-disable-next-line prefer-rest-params
        (window as any).dataLayer.push(arguments);
    } as (...args: any[]) => void;

    let isGtagIncluded = false;
    (document as DocumentMxGtag).mxGtag = {
        getGtag() {
            return gtagMethod;
        },
        ensureGtagIncluded(tagId: string) {
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
            }
        }
    };
}

export default (document as DocumentMxGtag).mxGtag;
