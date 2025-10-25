/**
 * EXAMPLE: React Component Migration Pattern
 *
 * This file demonstrates how to migrate vanilla TypeScript UI code to React.
 * Use this as a reference when migrating other parts of the application.
 */

import React, { useState, useEffect } from 'react';
import { showToast } from '@utils/toastUtils';
import { getIsEnabled } from '@utils/storage/getProperties';
import { setIsEnabled } from '@utils/storage/setProperties';

// ============================================================================
// BEFORE: Vanilla TypeScript (DOM manipulation)
// ============================================================================

/**
 * VANILLA APPROACH (before migration):
 *
 * document.addEventListener('DOMContentLoaded', async () => {
 *   const toggleButton = document.getElementById('toggleButton');
 *   const statusText = document.getElementById('statusText');
 *
 *   // Load initial state
 *   const isEnabled = await getIsEnabled();
 *   updateUI(isEnabled);
 *
 *   function updateUI(enabled: boolean) {
 *     if (statusText) {
 *       statusText.textContent = enabled ? 'Enabled' : 'Disabled';
 *     }
 *     if (toggleButton) {
 *       toggleButton.classList.toggle('active', enabled);
 *     }
 *   }
 *
 *   toggleButton?.addEventListener('click', async () => {
 *     const currentState = await getIsEnabled();
 *     const newState = !currentState;
 *     await setIsEnabled(newState);
 *     updateUI(newState);
 *     showToast('Settings updated', 'success');
 *   });
 * });
 */

// ============================================================================
// AFTER: React Component (state-driven)
// ============================================================================

/**
 * React Component Example
 *
 * Key differences:
 * 1. State is managed with React hooks (useState)
 * 2. Side effects use useEffect
 * 3. UI updates automatically when state changes
 * 4. No direct DOM manipulation
 * 5. TypeScript types for props and state
 */

interface ExampleComponentProps {
  title?: string;
}

const ExampleComponent: React.FC<ExampleComponentProps> = ({
  title = 'Settings',
}) => {
  // State management with hooks
  const [isEnabled, setIsEnabledState] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Load initial state (runs once on mount)
  useEffect(() => {
    const loadInitialState = async () => {
      try {
        setLoading(true);
        const enabled = await getIsEnabled();
        setIsEnabledState(enabled);
      } catch (error) {
        console.error('Error loading state:', error);
        showToast('Failed to load settings', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadInitialState();
  }, []); // Empty dependency array = run once on mount

  // Event handlers
  const handleToggle = async () => {
    try {
      const newState = !isEnabled;
      await setIsEnabled(newState);
      setIsEnabledState(newState);
      showToast('Settings updated', 'success');
    } catch (error) {
      console.error('Error saving state:', error);
      showToast('Failed to save settings', 'error');
    }
  };

  // Conditional rendering
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // JSX return (note: looks like HTML but it's JavaScript)
  return (
    <div className="example-component">
      <h2>{title}</h2>

      <div className="status">
        <p>Current status: {isEnabled ? 'Enabled' : 'Disabled'}</p>
      </div>

      <button
        className={`toggle-button ${isEnabled ? 'active' : ''}`}
        onClick={handleToggle}
        type="button"
      >
        {isEnabled ? 'Disable' : 'Enable'}
      </button>
    </div>
  );
};

// ============================================================================
// PATTERNS AND BEST PRACTICES
// ============================================================================

/**
 * Pattern 1: Reusable Components
 * Break down complex UI into smaller, reusable components
 */

interface ToggleProps {
  enabled: boolean;
  onToggle: () => void;
  label: string;
}

const Toggle: React.FC<ToggleProps> = ({ enabled, onToggle, label }) => {
  return (
    <div className="toggle-setting">
      <span className="setting-label">{label}</span>
      <button
        className={`creative-toggle ${enabled ? 'enabled' : ''}`}
        onClick={onToggle}
        aria-pressed={enabled}
      >
        <div className="toggle-track">
          <div className="toggle-thumb" />
        </div>
      </button>
    </div>
  );
};

/**
 * Pattern 2: Custom Hooks
 * Extract stateful logic into reusable hooks
 */

const useToggleSetting = (initialValue: boolean) => {
  const [value, setValue] = useState(initialValue);

  const toggle = () => setValue(!value);
  const enable = () => setValue(true);
  const disable = () => setValue(false);

  return { value, toggle, enable, disable, setValue };
};

// Usage:
// const { value: isDarkMode, toggle: toggleDarkMode } = useToggleSetting(false);

/**
 * Pattern 3: Loading and Error States
 * Always handle loading and error states
 */

interface DataState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

const useAsyncData = <T,>(fetchFn: () => Promise<T>): DataState<T> => {
  const [state, setState] = useState<DataState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setState({ data: null, loading: true, error: null });
        const data = await fetchFn();
        setState({ data, loading: false, error: null });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error : new Error('Unknown error'),
        });
      }
    };

    loadData();
  }, [fetchFn]);

  return state;
};

/**
 * Pattern 4: Cleanup
 * Always cleanup subscriptions and timers
 */

const ComponentWithCleanup: React.FC = () => {
  useEffect(() => {
    // Setup
    const intervalId = setInterval(() => {
      console.log('Periodic task');
    }, 1000);

    // Cleanup function (called when component unmounts)
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return <div>Component with cleanup</div>;
};

/**
 * Pattern 5: Conditional Rendering
 * Multiple ways to conditionally render content
 */

const ConditionalExample: React.FC<{ show: boolean; data?: string }> = ({
  show,
  data,
}) => {
  // Using if-return
  if (!show) return null;

  return (
    <div>
      {/* Using ternary operator */}
      {data ? <p>{data}</p> : <p>No data</p>}

      {/* Using && operator (for true case only) */}
      {data && <p>Data is available</p>}
    </div>
  );
};

// ============================================================================
// COMMON MIGRATION TASKS
// ============================================================================

/**
 * Task 1: Replace getElementById with state
 *
 * BEFORE:
 * const input = document.getElementById('myInput') as HTMLInputElement;
 * input.value = 'Hello';
 *
 * AFTER:
 * const [value, setValue] = useState('Hello');
 * <input value={value} onChange={(e) => setValue(e.target.value)} />
 */

/**
 * Task 2: Replace addEventListener with event handlers
 *
 * BEFORE:
 * button.addEventListener('click', () => { ... });
 *
 * AFTER:
 * <button onClick={() => { ... }}>Click me</button>
 */

/**
 * Task 3: Replace classList operations with className state
 *
 * BEFORE:
 * element.classList.add('active');
 * element.classList.toggle('hidden');
 *
 * AFTER:
 * const [isActive, setIsActive] = useState(false);
 * <div className={`my-class ${isActive ? 'active' : ''}`} />
 */

/**
 * Task 4: Replace innerHTML with JSX
 *
 * BEFORE:
 * element.innerHTML = `<div class="card">${data}</div>`;
 *
 * AFTER:
 * return <div className="card">{data}</div>;
 */

/**
 * Task 5: Replace style.display with conditional rendering
 *
 * BEFORE:
 * element.style.display = show ? 'block' : 'none';
 *
 * AFTER:
 * {show && <div>Content</div>}
 */

export default ExampleComponent;
export { Toggle, useToggleSetting, useAsyncData };
