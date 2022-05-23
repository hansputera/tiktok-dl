import dynamic from 'next/dynamic';
import {TabSelectorComponent} from '../components/TabSelector';

export default () => {
    return (
        <section className="p-5">
            <h1 className="align-middle text-4xl font-sans font-medium tracking-wide leading-relaxed">
                TikTok-DL{' '}
                <span className="font-normal md:break-words text-2xl">
                    Download TikTok Video without watermark and free ads.
                </span>
            </h1>

            <TabSelectorComponent
                tabs={[
                    {
                        name: 'Download',
                        component: dynamic(
                            () => import('../components/FormInput'),
                            {
                                loading: () => (
                                    <p className="font-sans antiliased text-center">
                                        Wait a minute!
                                    </p>
                                ),
                                ssr: false,
                            },
                        ),
                    },
                ]}
            />
        </section>
    );
};
