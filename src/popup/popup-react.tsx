import React from 'react';
import { createRoot } from 'react-dom/client';
import PopupApp from './PopupApp';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <PopupApp />
    </React.StrictMode>,
  );
} else {
  console.error('Root element not found');
}
