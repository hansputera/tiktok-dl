import {Component, ReactNode} from 'react';

interface Props {
    children: ReactNode;
    fallback: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * @class ErrorBoundary
 */
export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    /**
     * @param {Error} error an error.
     * @return {State}
     */
    public static getDerivedStateFromError(error: Error): State {
        return {hasError: true, error};
    }

    /**
     * Render error.
     * @return {JSX.Element}
     */
    public render(): JSX.Element {
        if (this.state.hasError) {
            return this.props.fallback as JSX.Element;
        }

        return this.props.children as JSX.Element;
    }
}
