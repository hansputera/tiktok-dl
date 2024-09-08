import dynamic from 'next/dynamic';
import {Footer} from '../components/Footer';

const FormInputComponentDynamic = dynamic(
    () => import('../components/FormInput'),
    {
        ssr: false,
    },
);

export default () => {
    return (
        <section className="p-5">
            <h1 className="align-middle text-4xl font-sans font-medium">
                TikTok-DL{' '}
                <span className="font-normal md:break-words text-2xl">
                    Download TikTok Video without watermark and free ads.
                </span>
            </h1>

            <FormInputComponentDynamic />
            <Footer />
        </section>
    );
};
