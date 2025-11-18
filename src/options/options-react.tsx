import React from 'react';
import { createRoot } from 'react-dom/client';
import OptionsApp from './OptionsApp';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <OptionsApp />
    </React.StrictMode>,
  );
} else {
  console.error('Root element not found');
}
