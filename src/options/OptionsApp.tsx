import React, { useEffect, useState } from 'react';
import {
  Tabs,
  TabList,
  TabButton,
  TabPanels,
  TabPanel,
} from '../components/Tabs';
import { getEnableDarkTheme } from '@utils/storage/getProperties';

/**
 * OptionsApp Component
 *
 * This is a DEMO/EXAMPLE of how the options page can be migrated to React.
 * This demonstrates the component structure and patterns to follow.
 *
 * TODO: Complete migration of all tabs and functionality
 */
const OptionsApp: React.FC = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const darkTheme = await getEnableDarkTheme();
      setIsDarkTheme(darkTheme);
      if (darkTheme) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    };

    loadTheme().catch(console.error);
  }, []);

  return (
    <>
      <h1>Settings</h1>
      <Tabs defaultTab="profiles">
        <TabList>
          <TabButton tabId="profiles">Profiles & Theme</TabButton>
          <TabButton tabId="api">API Keys & Consensus</TabButton>
          <TabButton tabId="metrics">Metrics</TabButton>
          <TabButton tabId="advanced">Advanced</TabButton>
          <TabButton tabId="about">About</TabButton>
        </TabList>

        <TabPanels>
          <TabPanel tabId="profiles">
            <div className="section">
              <h2 className="section-heading">Profiles</h2>
              <div className="profiles-container">
                <div className="profile-cards" id="profileCards">
                  {/* TODO: Implement ProfileCards component */}
                  <p>Profile cards will be rendered here</p>
                </div>
              </div>
            </div>
            <div className="section">
              <h2 className="section-heading">Theme & Behavior</h2>
              {/* TODO: Implement theme toggle component */}
              <p>Theme toggle will be here</p>
            </div>
          </TabPanel>

          <TabPanel tabId="api">
            <div className="section">
              <h2 className="section-heading">AI Model Settings</h2>
              {/* TODO: Implement API key management component */}
              <p>API key management will be here</p>
            </div>
          </TabPanel>

          <TabPanel tabId="metrics">
            <div className="section">
              <h2 className="section-heading">Usage Metrics</h2>
              {/* TODO: Implement metrics display component */}
              <p>Metrics display will be here</p>
            </div>
          </TabPanel>

          <TabPanel tabId="advanced">
            <div className="section">
              <h2 className="section-heading">Advanced Settings</h2>
              {/* TODO: Implement advanced settings component */}
              <p>Advanced settings will be here</p>
            </div>
          </TabPanel>

          <TabPanel tabId="about">
            <div className="section">
              <h2 className="section-heading">About docFiller</h2>
              <p>
                docFiller is an open-source browser extension that automates
                filling repetitive forms using GenAI. It supports multiple LLM
                providers, optional consensus across models, and a profiles
                system to tailor prompts and behavior to your workflow.
              </p>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Modals and toasts */}
      <div id="toast-container" className="toast-container">
        <div id="toast" className="toast">
          <div id="toast-message"></div>
        </div>
      </div>
    </>
  );
};

export default OptionsApp;
