declare namespace mx {
    import * as mxOriginal from "mendix-client";
    export interface MxInterface extends mxOriginal.mx.MxInterface {
        logger: mendix.Logger;
    }
}
