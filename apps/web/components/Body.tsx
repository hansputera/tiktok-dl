import React from 'react';

/**
 * Body Component.
 * @param {{children: JSX.Element}} param0 BodyComponent props.
 * @return {JSX.Element}
 */
export const BodyComponent = ({
    children,
}: {
    children: JSX.Element;
}): JSX.Element => {
    return (
        <React.Fragment>
            <section className="min-h-screen bg-light-200">
                <div className="md:container md:mx-auto">{children}</div>
            </section>
        </React.Fragment>
    );
};
