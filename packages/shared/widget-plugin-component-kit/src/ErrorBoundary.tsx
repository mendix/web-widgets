import { Component, PropsWithChildren, ReactNode } from "react";
import { Alert } from "./Alert";

type State = { error: Error | null };

type Props = PropsWithChildren<{
    fallback?: (error: Error) => ReactNode;
}>;

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { error: null };
    }

    render(): ReactNode {
        if (this.state.error === null) {
            return this.props.children;
        }

        if (this.props.fallback) {
            return this.props.fallback(this.state.error);
        }

        return (
            <Alert bootstrapStyle="danger">
                {this.state.error.message || "An error occurred in the sorting widget."}
            </Alert>
        );
    }

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }
}
