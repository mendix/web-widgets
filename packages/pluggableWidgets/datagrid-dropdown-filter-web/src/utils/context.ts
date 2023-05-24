import { FilterContextValue } from "@mendix/pluggable-widgets-commons/dist/components/web";

export function getProviderChannel(context: FilterContextValue): string | undefined {
    return context.providerData?.eventChannelName;
}
