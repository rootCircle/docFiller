/**
 * Response Cache Manager for DocFiller
 * Stores and retrieves responses to questions across sessions
 */

import { QType } from '@utils/questionTypes';
import { getResponseCacheMaxAge } from '@utils/storage/getProperties';
import { showToast } from '@utils/toastUtils';

interface CachedResponse {
  answer: string;
  timestamp: number;
  type: QType | string;
}

interface ResponseCache {
  [questionKey: string]: CachedResponse;
}

/**
 * Generates a unique key for a question
 * @param question The question text
 * @param type The type of question
 * @returns Normalized question text as a key
 */
function generateQuestionKey(question: string, type: QType | string): string {
  // Normalize the question by removing extra spaces and converting to lowercase
  const normalizedQuestion = question.trim().toLowerCase().replace(/\s+/g, ' ');
  // Include the type in the key to avoid collisions between different question types
  return `${type}:${normalizedQuestion}`;
}

/**
 * Store a response in the cache
 * @param question The question text
 * @param answer The answer text
 * @param type The question type
 * @returns Promise that resolves when storage is complete
 */
export async function storeResponse(
  question: string,
  answer: string,
  type: QType,
): Promise<void> {
  try {
    //biome-ignore lint/suspicious/noConsole: Debug logging
    console.log(`[CACHE] Storing ${type} response for question:`, question);

    // Get existing cached responses
    const cachedResponses = await getCachedResponses();
    //biome-ignore lint/suspicious/noConsole: Debug logging
    console.log(
      '[CACHE] Current cache has',
      Object.keys(cachedResponses).length,
      'entries',
    );

    const key = generateQuestionKey(question, type);
    //biome-ignore lint/suspicious/noConsole: Debug logging
    console.log('[CACHE] Generated key:', key);

    // Add or update this response
    cachedResponses[key] = {
      answer,
      timestamp: Date.now(),
      type,
    };

    // Store back to Chrome storage
    await chrome.storage.sync.set({ docFillerResponseCache: cachedResponses });
    //biome-ignore lint/suspicious/noConsole: Debug logging
    console.log(
      '[CACHE] Updated cache now has',
      Object.keys(cachedResponses).length,
      'entries',
    );
    //biome-ignore lint/suspicious/noConsole: Debug logging
    console.log('[CACHE] Successfully stored response for question:', question);
  } catch (error) {
    //biome-ignore lint/suspicious/noConsole: Error logging
    console.error('[CACHE ERROR] Error storing response:', error);
  }
}

/**
 * Get all cached responses
 * @returns Promise that resolves with the cached responses
 */
export async function getCachedResponses(): Promise<ResponseCache> {
  try {
    //biome-ignore lint/suspicious/noExplicitAny: Chrome storage returns generic object
    const result = await new Promise<{ [key: string]: any }>(
      (resolve, reject) => {
        chrome.storage.sync.get(['docFillerResponseCache'], (items) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(items);
          }
        });
      },
    );

    return result['docFillerResponseCache'] || {};
  } catch (error) {
    //biome-ignore lint/suspicious/noConsole: Error logging
    console.error('Error getting cached responses:', error);
    return {};
  }
}

/**
 * Get a cached response for a question
 * @param question The question text
 * @param type The question type
 * @returns Promise that resolves with the cached answer or null
 */
export async function getCachedResponse(
  question: string,
  type: QType,
): Promise<string | null> {
  try {
    //biome-ignore lint/suspicious/noConsole: Debug logging
    console.log(
      `[CACHE] Looking for cached ${type} response for question:`,
      question,
    );

    const cachedResponses = await getCachedResponses();
    //biome-ignore lint/suspicious/noConsole: Debug logging
    console.log(
      '[CACHE] Retrieved cache with',
      Object.keys(cachedResponses).length,
      'entries',
    );

    const key = generateQuestionKey(question, type);
    //biome-ignore lint/suspicious/noConsole: Debug logging
    console.log('[CACHE] Generated key:', key);
    //biome-ignore lint/suspicious/noConsole: Debug logging
    console.log('[CACHE] Available keys:', Object.keys(cachedResponses));

    if (cachedResponses[key]) {
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log(
        `[CACHE] Found matching entry for ${type} question:`,
        question,
      );
      return cachedResponses[key].answer;
    }

    // Fall back to old-style keys for backward compatibility
    const legacyKey = question.trim().toLowerCase().replace(/\s+/g, ' ');
    if (
      cachedResponses[legacyKey] &&
      (!type || cachedResponses[legacyKey].type === type)
    ) {
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log(
        `[CACHE] Found legacy key match for ${type} question:`,
        question,
      );
      return cachedResponses[legacyKey].answer;
    }

    //biome-ignore lint/suspicious/noConsole: Debug logging
    console.log(`[CACHE] No cached ${type} response found for:`, question);
    return null;
  } catch (error) {
    //biome-ignore lint/suspicious/noConsole: Error logging
    console.error('[CACHE ERROR] Error getting cached response:', error);
    return null;
  }
}

/**
 * Creates an appropriate LLM response object based on the question type and cached text
 * @param cachedResponseText The cached response text
 * @param questionType The question type
 * @returns An appropriate LLM response object
 */
//biome-ignore lint/suspicious/noExplicitAny: Function returns different response types based on question type
export function createResponseFromCache(
  cachedResponseText: string,
  questionType: QType,
): any {
  //biome-ignore lint/suspicious/noConsole: Debug logging
  console.log(
    `[CACHE DEBUG] Creating response from cache for type: ${questionType}`,
  );
  //biome-ignore lint/suspicious/noConsole: Debug logging
  console.log(
    `[CACHE DEBUG] Cached text: ${cachedResponseText.substring(0, 100)}${cachedResponseText.length > 100 ? '...' : ''}`,
  );

  // Handle different response formats based on question type
  if (
    questionType === QType.MULTIPLE_CHOICE ||
    questionType === QType.MULTIPLE_CHOICE_WITH_OTHER
  ) {
    try {
      // Try to parse JSON for multiple choice responses
      const parsedChoice = JSON.parse(cachedResponseText);
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE DEBUG] Successfully parsed MCQ JSON');
      return {
        multipleChoice: parsedChoice,
      };
    } catch (_e) {
      // Fallback to text if parsing fails
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE] Failed to parse MCQ response, using as text');
      return { text: cachedResponseText };
    }
  } else if (
    questionType === QType.MULTI_CORRECT ||
    questionType === QType.MULTI_CORRECT_WITH_OTHER
  ) {
    try {
      // Try to parse as JSON array for multi-correct responses
      const parsedChoices = JSON.parse(cachedResponseText);
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE DEBUG] Successfully parsed Multi-correct JSON');
      return {
        multiCorrect: parsedChoices,
      };
    } catch (_e) {
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log(
        '[CACHE] Failed to parse multi-correct response, using as text',
      );
      return { text: cachedResponseText };
    }
  } else if (questionType === QType.MULTIPLE_CHOICE_GRID) {
    try {
      const parsedGrid = JSON.parse(cachedResponseText);
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log(
        '[CACHE DEBUG] Successfully parsed Multiple Choice Grid JSON',
      );
      return {
        multipleChoiceGrid: parsedGrid,
        // Also include grid property for compatibility
        grid: parsedGrid,
      };
    } catch (_e) {
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log(
        '[CACHE] Failed to parse multiple choice grid response, using as text',
      );
      return { text: cachedResponseText };
    }
  } else if (questionType === QType.CHECKBOX_GRID) {
    try {
      const parsedGrid = JSON.parse(cachedResponseText);
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE DEBUG] Successfully parsed Checkbox Grid JSON');
      return {
        checkboxGrid: parsedGrid,
        // Also include grid property for compatibility
        grid: parsedGrid,
      };
    } catch (_e) {
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log(
        '[CACHE] Failed to parse checkbox grid response, using as text',
      );
      return { text: cachedResponseText };
    }
  } else if (questionType === QType.LINEAR_SCALE_OR_STAR) {
    try {
      // Try to parse as number first (common for ratings)
      if (!Number.isNaN(Number(cachedResponseText))) {
        const numValue = Number(cachedResponseText);
        //biome-ignore lint/suspicious/noConsole: Debug logging
        console.log('[CACHE DEBUG] Parsed linear scale as number:', numValue);
        return {
          linearScale: numValue,
          scale: numValue,
          rating: numValue,
          text: cachedResponseText,
        };
      }

      // Otherwise try to parse as JSON
      const parsedScale = JSON.parse(cachedResponseText);
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE DEBUG] Successfully parsed Linear Scale JSON');
      return {
        linearScale: parsedScale,
        scale: parsedScale,
        rating: parsedScale,
      };
    } catch (_e) {
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log(
        '[CACHE] Failed to parse linear scale response, using as text',
      );
      return { text: cachedResponseText };
    }
  } else if (questionType === QType.DROPDOWN) {
    try {
      // Try to parse as JSON for dropdown responses
      //biome-ignore lint/suspicious/noImplicitAnyLet: Using mixed type by design
      const parsedDropdown = JSON.parse(cachedResponseText);
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE DEBUG] Successfully parsed Dropdown JSON');
      return {
        dropdown: parsedDropdown,
        selection: parsedDropdown,
        text: cachedResponseText,
      };
    } catch (_e) {
      // For dropdown, fallback to text
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE] Using text for dropdown response');
      return {
        dropdown: cachedResponseText,
        selection: cachedResponseText,
        text: cachedResponseText,
      };
    }
  } else if (questionType === QType.TEXT_EMAIL) {
    // For email text, just use the text response but in email format
    //biome-ignore lint/suspicious/noConsole: Debug logging
    console.log('[CACHE DEBUG] Using email text response');
    return {
      email: cachedResponseText,
      text: cachedResponseText,
    };
  } else if (questionType === QType.TEXT_URL) {
    // For URL text, just use the text response but in URL format
    //biome-ignore lint/suspicious/noConsole: Debug logging
    console.log('[CACHE DEBUG] Using URL text response');
    return {
      url: cachedResponseText,
      text: cachedResponseText,
    };
  } else if (
    questionType === QType.DATE ||
    questionType === QType.DATE_AND_TIME ||
    questionType === QType.TIME ||
    questionType === QType.DURATION ||
    questionType === QType.DATE_WITHOUT_YEAR ||
    questionType === QType.DATE_TIME_WITHOUT_YEAR ||
    questionType === QType.DATE_TIME_WITH_MERIDIEM ||
    questionType === QType.TIME_WITH_MERIDIEM ||
    questionType === QType.DATE_TIME_WITH_MERIDIEM_WITHOUT_YEAR
  ) {
    try {
      // Try to parse as JSON for date/time responses
      const parsedDateTime = JSON.parse(cachedResponseText);
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE DEBUG] Successfully parsed DateTime JSON');
      return {
        dateTime: parsedDateTime,
        date: parsedDateTime.date || parsedDateTime,
        time: parsedDateTime.time || parsedDateTime,
        text: cachedResponseText,
      };
    } catch (_e) {
      // For date/time types, just use the text response
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE] Using text for date/time response');
      return {
        dateTime: cachedResponseText,
        date: cachedResponseText,
        time: cachedResponseText,
        text: cachedResponseText,
      };
    }
  } else {
    // For text types, just use the text response
    //biome-ignore lint/suspicious/noConsole: Debug logging
    console.log('[CACHE DEBUG] Using text response for', questionType);
    return {
      text: cachedResponseText,
    };
  }
}

/**
 * Prepares a response for caching based on the response object and type
 * @param response The response object
 * @param type The question type
 * @returns A string representation of the response suitable for caching
 */
//biome-ignore lint/suspicious/noExplicitAny: Function handles different response types
export function prepareResponseForCache(
  response: any,
  type: QType,
): string | null {
  if (!response) {
    //biome-ignore lint/suspicious/noConsole: Error logging
    console.error('[CACHE] Cannot prepare null response for caching');
    return null;
  }

  //biome-ignore lint/suspicious/noConsole: Debug logging
  console.log(`[CACHE DEBUG] Preparing response for type: ${type}`);
  //biome-ignore lint/suspicious/noConsole: Debug logging
  console.log('[CACHE DEBUG] Response properties:', Object.keys(response));

  // Store the response based on question type
  if (
    type === QType.MULTIPLE_CHOICE ||
    type === QType.MULTIPLE_CHOICE_WITH_OTHER
  ) {
    if (response.multipleChoice) {
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE DEBUG] Found multipleChoice property');
      // Store as JSON string
      return JSON.stringify(response.multipleChoice);
    }

    if (response.text) {
      // Fallback to text
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log(
        '[CACHE DEBUG] No multipleChoice property, falling back to text',
      );
      return response.text;
    }
  } else if (
    type === QType.MULTI_CORRECT ||
    type === QType.MULTI_CORRECT_WITH_OTHER
  ) {
    if (response.multiCorrect) {
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE DEBUG] Found multiCorrect property');
      // Store as JSON string
      return JSON.stringify(response.multiCorrect);
    }

    if (response.text) {
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log(
        '[CACHE DEBUG] No multiCorrect property, falling back to text',
      );
      return response.text;
    }
  } else if (type === QType.MULTIPLE_CHOICE_GRID) {
    //biome-ignore lint/suspicious/noConsole: Debug logging
    console.log('[CACHE DEBUG] Processing MULTIPLE_CHOICE_GRID');
    if (response.multipleChoiceGrid) {
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE DEBUG] Found multipleChoiceGrid property');
      return JSON.stringify(response.multipleChoiceGrid);
    }

    if (response.grid) {
      // Alternative property name
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log(
        '[CACHE DEBUG] Found grid property instead of multipleChoiceGrid',
      );
      return JSON.stringify(response.grid);
    }

    if (response.text) {
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE DEBUG] No grid properties, falling back to text');
      return response.text;
    }
  } else if (type === QType.CHECKBOX_GRID) {
    //biome-ignore lint/suspicious/noConsole: Debug logging
    console.log('[CACHE DEBUG] Processing CHECKBOX_GRID');
    if (response.checkboxGrid) {
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE DEBUG] Found checkboxGrid property');
      return JSON.stringify(response.checkboxGrid);
    }

    if (response.grid) {
      // Alternative property name
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE DEBUG] Found grid property instead of checkboxGrid');
      return JSON.stringify(response.grid);
    }

    if (response.checkGrid) {
      // Another alternative property name
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE DEBUG] Found checkGrid property');
      return JSON.stringify(response.checkGrid);
    }

    if (response.text) {
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE DEBUG] No grid properties, falling back to text');
      return response.text;
    }
  } else if (type === QType.LINEAR_SCALE_OR_STAR) {
    //biome-ignore lint/suspicious/noConsole: Debug logging
    console.log('[CACHE DEBUG] Processing LINEAR_SCALE_OR_STAR');
    if (response.linearScale !== undefined) {
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log(
        '[CACHE DEBUG] Found linearScale property:',
        response.linearScale,
      );
      return JSON.stringify(response.linearScale);
    }

    if (response.scale !== undefined) {
      // Alternative property name
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log(
        '[CACHE DEBUG] Found scale property instead of linearScale:',
        response.scale,
      );
      return JSON.stringify(response.scale);
    }

    if (response.rating !== undefined) {
      // Another alternative property name
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE DEBUG] Found rating property:', response.rating);
      return JSON.stringify(response.rating);
    }

    if (response.value !== undefined) {
      // Direct value
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE DEBUG] Found value property:', response.value);
      return JSON.stringify(response.value);
    }

    if (response.text && !isNaN(Number(response.text))) {
      // Text that's a number
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE DEBUG] Found numeric text:', response.text);
      return response.text;
    }

    if (typeof response === 'number' || !isNaN(Number(response))) {
      // Handle direct number responses
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE DEBUG] Found direct number value:', response);
      return String(response);
    }

    if (response.text) {
      return response.text;
    }
  } else if (type === QType.DROPDOWN) {
    //biome-ignore lint/suspicious/noConsole: Debug logging
    console.log('[CACHE DEBUG] Processing DROPDOWN type');
    if (response.dropdown) {
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE DEBUG] Found dropdown property');
      return JSON.stringify(response.dropdown);
    }

    if (response.selection) {
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE DEBUG] Found selection property');
      return JSON.stringify(response.selection);
    }

    if (response.text) {
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE DEBUG] No dropdown property, falling back to text');
      return response.text;
    }
  } else if (type === QType.TEXT_EMAIL) {
    //biome-ignore lint/suspicious/noConsole: Debug logging
    console.log('[CACHE DEBUG] Processing TEXT_EMAIL type');
    if (response.email) {
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE DEBUG] Found email property');
      return response.email;
    }

    if (response.text) {
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE DEBUG] No email property, falling back to text');
      return response.text;
    }
  } else if (type === QType.TEXT_URL) {
    //biome-ignore lint/suspicious/noConsole: Debug logging
    console.log('[CACHE DEBUG] Processing TEXT_URL type');
    if (response.url) {
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE DEBUG] Found url property');
      return response.url;
    }

    if (response.text) {
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE DEBUG] No url property, falling back to text');
      return response.text;
    }
  } else if (
    type === QType.DATE ||
    type === QType.DATE_AND_TIME ||
    type === QType.TIME ||
    type === QType.DURATION ||
    type === QType.DATE_WITHOUT_YEAR ||
    type === QType.DATE_TIME_WITHOUT_YEAR ||
    type === QType.DATE_TIME_WITH_MERIDIEM ||
    type === QType.TIME_WITH_MERIDIEM ||
    type === QType.DATE_TIME_WITH_MERIDIEM_WITHOUT_YEAR
  ) {
    //biome-ignore lint/suspicious/noConsole: Debug logging
    console.log('[CACHE DEBUG] Processing DATE/TIME type:', type);
    if (response.dateTime) {
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE DEBUG] Found dateTime property');
      return JSON.stringify(response.dateTime);
    }

    if (response.date) {
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE DEBUG] Found date property');
      return JSON.stringify(response.date);
    }

    if (response.time) {
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE DEBUG] Found time property');
      return JSON.stringify(response.time);
    }

    if (response.text) {
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log(
        '[CACHE DEBUG] No date/time properties, falling back to text',
      );
      return response.text;
    }
  }

  if (response.text) {
    // For text-based responses (TEXT, PARAGRAPH, etc.)
    //biome-ignore lint/suspicious/noConsole: Debug logging
    console.log('[CACHE DEBUG] Using text property for', type);
    return response.text;
  }

  if (typeof response === 'string') {
    // Direct string responses
    //biome-ignore lint/suspicious/noConsole: Debug logging
    console.log('[CACHE DEBUG] Response is a direct string');
    return response;
  }

  //biome-ignore lint/suspicious/noConsole: Debug logging
  console.log('[CACHE DEBUG] No suitable response content found for', type);
  return null; // No suitable response content found
}

/**
 * Clear all cached responses
 * @returns Promise that resolves when the cache is cleared
 */
export async function clearResponseCache(): Promise<void> {
  try {
    await chrome.storage.sync.remove('docFillerResponseCache');
    //biome-ignore lint/suspicious/noConsole: Debug logging
    console.log('[CACHE] Response cache cleared successfully');

    // Show success toast
    showToast('Response cache cleared successfully', 'success');

    // Add a delay to ensure toast is visible before any page reload
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2500); // 2.5 second delay
    });
  } catch (error) {
    //biome-ignore lint/suspicious/noConsole: Error logging
    console.error('[CACHE ERROR] Error clearing response cache:', error);

    // Show error toast
    showToast('Failed to clear response cache', 'error');

    // Add a delay for the error toast as well
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2500); // 2.5 second delay
    });
  }
}

/**
 * Clear cached responses older than a specified time
 * @param maxAge Maximum age in milliseconds
 * @returns Promise that resolves when old entries are cleared
 */
export async function clearOldResponses(maxAge: number): Promise<void> {
  try {
    const cachedResponses = await getCachedResponses();
    const now = Date.now();
    let hasChanges = false;
    let removedCount = 0;

    // Remove old entries
    for (const key in cachedResponses) {
      if (
        cachedResponses[key] &&
        now - cachedResponses[key].timestamp > maxAge
      ) {
        //biome-ignore lint/suspicious/noConsole: Debug logging
        console.log(`[CACHE] Removing old entry: ${key}`);
        delete cachedResponses[key];
        hasChanges = true;
        removedCount++;
      }
    }

    // Only update storage if we removed entries
    if (hasChanges) {
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log(`[CACHE] Removed ${removedCount} old entries`);
      await chrome.storage.sync.set({
        docFillerResponseCache: cachedResponses,
      });
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE] Old responses cleared from cache');
    } else {
      //biome-ignore lint/suspicious/noConsole: Debug logging
      console.log('[CACHE] No old entries to remove');
    }
  } catch (error) {
    //biome-ignore lint/suspicious/noConsole: Error logging
    console.error('[CACHE ERROR] Error clearing old responses:', error);
  }
}

/**
 * Get cache statistics
 * @returns Promise resolving to an object with cache statistics
 */
// export async function getCacheStats(): Promise<{
//   totalEntries: number;
//   byType: { [type: string]: number };
//   oldestEntry: Date | null;
//   newestEntry: Date | null;
// }> {
//   try {
//     const cachedResponses = await getCachedResponses();
//     const keys = Object.keys(cachedResponses);

//     if (keys.length === 0) {
//       return {
//         totalEntries: 0,
//         byType: {},
//         oldestEntry: null,
//         newestEntry: null,
//       };
//     }

//     let oldest = Infinity;
//     let newest = 0;
//     const typeCount: { [type: string]: number } = {};

//     for (const key of keys) {
//       const entry = cachedResponses[key];

//       // Convert type to string for counting
//       const typeString = String(entry.type);

//       // Update type counts
//       if (!typeCount[typeString]) {
//         typeCount[typeString] = 0;
//       }
//       typeCount[typeString]++;

//       // Update timestamps
//       if (entry.timestamp < oldest) oldest = entry.timestamp;
//       if (entry.timestamp > newest) newest = entry.timestamp;
//     }

//     return {
//       totalEntries: keys.length,
//       byType: typeCount,
//       oldestEntry: new Date(oldest),
//       newestEntry: new Date(newest),
//     };
//   } catch (error) {
//     console.error('[CACHE ERROR] Error getting cache stats:', error);
//     return {
//       totalEntries: 0,
//       byType: {},
//       oldestEntry: null,
//       newestEntry: null,
//     };
//   }
// }

/**
 * Auto-clean old cache entries based on maxAge setting
 * Call this function periodically to keep the cache from growing too large
 */
// export async function autoCleanCache(): Promise<void> {
//   try {
//     const maxAge = await getResponseCacheMaxAge();
//     await clearOldResponses(maxAge);
//     const stats = await getCacheStats();
//     console.log('[CACHE] Auto-clean complete. Current cache stats:', stats);
//   } catch (error) {
//     console.error('[CACHE ERROR] Error during auto-clean:', error);
//   }
// }
