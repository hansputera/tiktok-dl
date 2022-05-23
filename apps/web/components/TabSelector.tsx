import React, {ComponentType} from 'react';

type TabPage = {
    name: string;
    component: ComponentType;
};

/**
 *
 * @param {{tabs: TabPage[]}} param0 TabSelector props.
 * @return {JSX.Element}
 */
export const TabSelectorComponent = ({
    tabs,
}: {
    tabs: TabPage[];
}): JSX.Element => {
    const [tab, setTab] = React.useState<TabPage>();

    return (
        <>
            <ul className="flex flex-col md:flex-row flex-grow">
                {tabs.map((tabPage) => (
                    <>
                        <li className="list-none">
                            <a
                                href={'#tab-'.concat(
                                    tabPage.name.toLowerCase(),
                                )}
                                onClick={() => setTab(tabPage)}
                            >
                                {tabPage.name}
                            </a>
                        </li>
                        <span className="ml-3 mr-3">|</span>
                    </>
                ))}
            </ul>
            {tab ? tab.component : <></>}
        </>
    );
};
