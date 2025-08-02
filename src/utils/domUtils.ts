/**
 * Safe DOM utility functions to prevent runtime errors from null element access
 */

/**
 * Safely get an element by ID with proper type checking
 */
export function safeGetElementById<T extends HTMLElement = HTMLElement>(
  id: string,
): T | null {
  const element = document.getElementById(id);
  return element as T | null;
}

/**
 * Safely get an element by ID and require it to exist (throws meaningful error if not found)
 */
export function requireElementById<T extends HTMLElement = HTMLElement>(
  id: string,
  context?: string,
): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(
      `Required element with ID '${id}' not found${context ? ` in ${context}` : ''}`,
    );
  }
  return element as T;
}

/**
 * Safely query selector with proper type checking
 */
export function safeQuerySelector<T extends HTMLElement = HTMLElement>(
  parent: ParentNode,
  selector: string,
): T | null {
  const element = parent.querySelector(selector);
  return element as T | null;
}

/**
 * Safely query selector and require it to exist
 */
export function requireQuerySelector<T extends HTMLElement = HTMLElement>(
  parent: ParentNode,
  selector: string,
  context?: string,
): T {
  const element = parent.querySelector(selector);
  if (!element) {
    throw new Error(
      `Required element with selector '${selector}' not found${context ? ` in ${context}` : ''}`,
    );
  }
  return element as T;
}

/**
 * Execute a function if an element exists, otherwise log a warning
 */
export function ifElementExists<T extends HTMLElement = HTMLElement>(
  id: string,
  callback: (element: T) => void,
  context?: string,
): void {
  const element = safeGetElementById<T>(id);
  if (element) {
    callback(element);
  } else {
    // biome-ignore lint/suspicious/noConsole: Essential DOM debugging utility
    console.warn(
      `Element with ID '${id}' not found${context ? ` in ${context}` : ''}`,
    );
  }
}

/**
 * Execute a function if elements exist, otherwise handle gracefully
 */
export function ifElementsExist(
  ids: string[],
  callback: (elements: HTMLElement[]) => void,
  context?: string,
): void {
  const elements = ids
    .map((id) => document.getElementById(id))
    .filter(Boolean) as HTMLElement[];

  if (elements.length === ids.length) {
    callback(elements);
  } else {
    const missing = ids.filter((id) => !document.getElementById(id));
    // biome-ignore lint/suspicious/noConsole: Essential DOM debugging utility
    console.warn(
      `Missing elements: ${missing.join(', ')}${context ? ` in ${context}` : ''}`,
    );
  }
}
