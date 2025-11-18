import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

interface TabContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

interface TabsProps {
  children: ReactNode;
  defaultTab: string;
}

export const Tabs: React.FC<TabsProps> = ({ children, defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="container">{children}</div>
    </TabContext.Provider>
  );
};

interface TabListProps {
  children: ReactNode;
}

export const TabList: React.FC<TabListProps> = ({ children }) => {
  return (
    <nav className="tab-nav" role="tablist" aria-label="Settings Tabs">
      {children}
    </nav>
  );
};

interface TabButtonProps {
  tabId: string;
  children: ReactNode;
}

export const TabButton: React.FC<TabButtonProps> = ({ tabId, children }) => {
  const context = useContext(TabContext);
  if (!context) throw new Error('TabButton must be used within Tabs');

  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === tabId;

  return (
    <button
      className={`tab-link ${isActive ? 'active' : ''}`}
      id={`tab-${tabId}-btn`}
      role="tab"
      aria-selected={isActive}
      aria-controls={`tab-${tabId}`}
      onClick={() => setActiveTab(tabId)}
    >
      {children}
    </button>
  );
};

interface TabPanelsProps {
  children: ReactNode;
}

export const TabPanels: React.FC<TabPanelsProps> = ({ children }) => {
  return <div className="tab-panels">{children}</div>;
};

interface TabPanelProps {
  tabId: string;
  children: ReactNode;
}

export const TabPanel: React.FC<TabPanelProps> = ({ tabId, children }) => {
  const context = useContext(TabContext);
  if (!context) throw new Error('TabPanel must be used within Tabs');

  const { activeTab } = context;
  const isActive = activeTab === tabId;

  return (
    <section
      id={`tab-${tabId}`}
      className={`tab-panel ${isActive ? 'active' : ''}`}
      role="tabpanel"
      aria-labelledby={`tab-${tabId}-btn`}
    >
      {children}
    </section>
  );
};
