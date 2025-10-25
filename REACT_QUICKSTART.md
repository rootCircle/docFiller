# React Component Development Quick Start

This is a quick reference for developers working on React components in docFiller.

## Quick Commands

```bash
# Install dependencies
bun install

# Build for development
bun run build:firefox    # Firefox
bun run build:chromium   # Chromium

# Development with hot reload
bun run dev:firefox
bun run dev:chromium

# Type checking
bun run typecheck

# Linting
bun run lint
bun run lint:fix
```

## Creating a New React Component

1. Create a new `.tsx` file in the appropriate directory:
   - `src/components/` for shared components
   - `src/popup/` for popup-specific components
   - `src/options/` for options-specific components

2. Use this template:

```tsx
import React, { useState, useEffect } from 'react';

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  const [state, setState] = useState<string>('');

  useEffect(() => {
    // Initialize component
    return () => {
      // Cleanup
    };
  }, []);

  return (
    <div>
      <h2>{title}</h2>
      {/* Your JSX here */}
    </div>
  );
};

export default MyComponent;
```

## Common Patterns

### Using Storage

```tsx
import { getIsEnabled } from '@utils/storage/getProperties';
import { setIsEnabled } from '@utils/storage/setProperties';

const [enabled, setEnabled] = useState(false);

useEffect(() => {
  getIsEnabled().then(setEnabled);
}, []);

const toggle = async () => {
  const newState = !enabled;
  await setIsEnabled(newState);
  setEnabled(newState);
};
```

### Using Browser APIs

```tsx
import browser from 'webextension-polyfill';

const handleClick = async () => {
  const tabs = await browser.tabs.query({ active: true });
  // Use tabs...
};
```

### Showing Toasts

```tsx
import { showToast } from '@utils/toastUtils';

const handleAction = () => {
  showToast('Action completed!', 'success');
};
```

## File Locations

- **Documentation**: `docs/REACT_MIGRATION.md`
- **Examples**: `src/components/MigrationExample.tsx`
- **Components**: `src/components/`
- **Popup**: `src/popup/`
- **Options**: `src/options/`

## Need Help?

1. Check `docs/REACT_MIGRATION.md` for detailed guide
2. Review `src/components/MigrationExample.tsx` for patterns
3. Look at existing components (PopupApp.tsx, Tabs.tsx)
4. Join Discord: https://discord.gg/Sa4JPe4FWT

## Migration Status

Current: ✅ Infrastructure ready, popup migrated
Next: 🚧 Options page migration in progress

See `docs/MIGRATION_SUMMARY.md` for complete status.
