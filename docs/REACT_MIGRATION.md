# React Migration Guide for docFiller

This document explains how to work with React components in the docFiller project.

## Overview

The docFiller extension is being incrementally migrated from vanilla HTML/CSS/TypeScript to React with TypeScript. This migration enables better state management, component reusability, and maintainability.

## Current Status

### Migrated to React

- ✅ Popup page (React version available at `src/popup/popup-react.tsx`)

### Still in Vanilla TS

- ⏳ Options page (migration in progress)
- ⏳ Other UI components

## Architecture

### File Structure

```
src/
├── popup/
│   ├── popup.ts           # Original vanilla TS version
│   ├── popup-react.tsx    # React entry point
│   └── PopupApp.tsx       # Main React component
├── options/
│   └── options.ts         # Original vanilla TS version (to be migrated)
└── utils/                 # Shared utilities (works with both vanilla and React)
```

### HTML Files

```
public/src/
├── popup/
│   ├── index.html         # Original popup HTML (uses popup.js)
│   └── index-react.html   # React popup HTML (uses popup-react.js)
└── options/
    └── index.html         # Original options HTML
```

## Development

### Building

The build process automatically handles both TypeScript and React/TSX files:

```bash
# Build for Firefox
bun run build:firefox

# Build for Chromium
bun run build:chromium

# Watch mode for development
bun run watch
```

### Hot Reloading

Hot reloading works for both vanilla TS and React files:

```bash
# Firefox with hot reload
bun run dev:firefox

# Chromium with hot reload
bun run dev:chromium
```

When you modify a React component:

1. The watcher detects the change
2. esbuild rebuilds the file
3. The extension reloads automatically

## Creating React Components

### Basic Component Structure

```tsx
import React, { useState, useEffect } from 'react';

const MyComponent: React.FC = () => {
  const [state, setState] = useState<string>('');

  useEffect(() => {
    // Component initialization
    return () => {
      // Cleanup
    };
  }, []);

  return <div>{/* Your JSX here */}</div>;
};

export default MyComponent;
```

### Using Extension APIs

Extension APIs work the same way in React components:

```tsx
import browser from 'webextension-polyfill';
import { showToast } from '@utils/toastUtils';

const MyComponent: React.FC = () => {
  const handleAction = async () => {
    const tabs = await browser.tabs.query({ active: true });
    showToast('Action completed', 'success');
  };

  return <button onClick={handleAction}>Click me</button>;
};
```

### Accessing Storage

Use the existing storage utilities:

```tsx
import { getIsEnabled } from '@utils/storage/getProperties';
import { setIsEnabled } from '@utils/storage/setProperties';

const MyComponent: React.FC = () => {
  const [enabled, setEnabledState] = useState(false);

  useEffect(() => {
    const loadState = async () => {
      const isEnabled = await getIsEnabled();
      setEnabledState(isEnabled);
    };
    loadState();
  }, []);

  const toggleEnabled = async () => {
    const newState = !enabled;
    await setIsEnabled(newState);
    setEnabledState(newState);
  };

  return (
    <button onClick={toggleEnabled}>{enabled ? 'Enabled' : 'Disabled'}</button>
  );
};
```

## Best Practices

### 1. Keep Logic in Utils

Move complex logic to utility functions in `src/utils/`:

- Keeps components focused on UI
- Allows code reuse between vanilla and React code
- Easier to test

### 2. Use TypeScript Strictly

- Always define prop types
- Use type inference where possible
- Avoid `any` types

### 3. Handle Async Operations Properly

```tsx
useEffect(() => {
  const loadData = async () => {
    try {
      const data = await fetchData();
      setData(data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };
  loadData();
}, []);
```

### 4. Clean Up Resources

```tsx
useEffect(() => {
  const subscription = subscribeToUpdates();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

## Migration Strategy

### Phase 1: Infrastructure ✅

- Add React dependencies
- Configure build system
- Create basic React components

### Phase 2: Popup Migration ✅

- Create React version of popup
- Test functionality
- Switch to React as default

### Phase 3: Options Page Migration 🚧

- Break down options page into components
- Migrate tab by tab
- Test all features

### Phase 4: Polish

- Optimize bundle size
- Add state management if needed
- Update documentation

## Testing

### Manual Testing

1. Load the extension in development mode
2. Test all features work correctly
3. Verify hot reloading works

### Type Checking

```bash
bun run typecheck
```

### Linting

```bash
bun run lint
bun run format:check
```

## Troubleshooting

### Build Errors

- Ensure all imports use correct paths
- Check TSX syntax is valid
- Verify React is imported when using JSX

### Hot Reload Not Working

- Check watcher is running
- Verify file changes are saved
- Try rebuilding from scratch

### Type Errors

- Update tsconfig.json if needed
- Check types are properly imported
- Ensure @types/react is installed

## Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [esbuild Documentation](https://esbuild.github.io/)
