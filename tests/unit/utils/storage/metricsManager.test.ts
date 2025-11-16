import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@utils/settings', () => ({
  EMPTY_STRING: '',
}));

import { LLMEngineType } from '@utils/llmEngineTypes';
import { MetricsManager } from '@utils/storage/metricsManager';

const baseMetrics: MetricsData = {
  history: [],
  formMetrics: {
    totalFormsFilled: 0,
    successfulFills: 0,
    failedFills: 0,
    lastFilledDate: '',
    activeStreak: 0,
    currentStreak: 0,
  },
  timeMetrics: {
    averageTimePerForm: 0,
    totalHoursSaved: 0,
    totalMinSaved: 0,
    totalSecSaved: 0,
  },
  aiMetrics: {
    apiCalls: {} as Record<LLMEngineType, number>,
    tokenUsage: {} as Record<LLMEngineType, number>,
    averageResponseTime: {} as Record<LLMEngineType, number>,
  },
};

const getStorageItemMock = vi.fn(async () => structuredClone(baseMetrics));
const setStorageItemMock = vi.fn(async () => undefined);

vi.mock('@utils/storage/storageHelper', () => ({
  getStorageItem: (...args: unknown[]) => getStorageItemMock(...args),
  setStorageItem: (...args: unknown[]) => setStorageItemMock(...args),
}));

const calculateStreaksMock = vi.fn(() => ({
  currentStreak: 3,
  activeStreak: 5,
}));
const calculateTimeSavedMock = vi.fn(() => ({
  totalHours: 1,
  totalMin: 30,
  totalSec: 0,
  dailyTrend: 10,
}));

vi.mock('@utils/metricsCalculator', () => ({
  MetricsCalculator: {
    calculateStreaks: (...args: unknown[]) => calculateStreaksMock(...args),
    calculateTimeSaved: (...args: unknown[]) => calculateTimeSavedMock(...args),
  },
}));

describe('MetricsManager', () => {
  let manager: MetricsManager;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
    manager = MetricsManager.getInstance();
    setStorageItemMock.mockClear();
    getStorageItemMock.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('tracks current form metrics and response time', () => {
    manager.startFormFilling(2);
    manager.incrementTotalQuestions(1);
    manager.incrementToBeFilledQuestions();
    manager.incrementSuccessfulQuestions();
    manager.addResponseTime(1.5);

    const current = manager.getCurrentFormMetrics();
    expect(current.totalQuestions).toBe(3);
    expect(current.successfulQuestions).toBe(1);
    expect(current.toBeFilledQuestions).toBe(1);
    expect(current.responseTime).toBe(1.5);
  });

  it('persists metrics on endFormFilling', async () => {
    manager.startFormFilling(1);
    manager.incrementSuccessfulQuestions();
    vi.advanceTimersByTime(2000);

    await manager.endFormFilling(LLMEngineType.ChatGPT);

    expect(getStorageItemMock).toHaveBeenCalled();
    expect(setStorageItemMock).toHaveBeenCalled();
    expect(calculateStreaksMock).toHaveBeenCalled();
    expect(calculateTimeSavedMock).toHaveBeenCalled();
  });

  it('resets stored metrics safely', () => {
    const spy = vi
      .spyOn(browser.storage.sync, 'set')
      .mockImplementation(() => Promise.resolve());
    manager.resetMetrics();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
