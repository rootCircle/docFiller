import type { LLMEngineType } from '@utils/llmEngineTypes';
import { MetricsCalculator } from '@utils/metricsCalculator';
import { getStorageItem, setStorageItem } from '@utils/storage/storageHelper';

export class MetricsManager {
  private static instance: MetricsManager;
  private static readonly STORAGE_KEY = 'metrics';
  private static readonly MAX_HISTORY_DAYS = 15; //ADD 1 Extra to accumulate removed days data in last day
  private formStartTime = 0;

  private currentFormMetrics = {
    totalQuestions: 0,
    successfulQuestions: 0,
    alreadyFilledQuestions: 0,
    toBeFilledQuestions: 0,
    responseTime: 0,
  };

  private constructor() {}

  public static getInstance(): MetricsManager {
    if (!MetricsManager.instance) {
      MetricsManager.instance = new MetricsManager();
    }
    return MetricsManager.instance;
  }
  public addResponseTime(time: number): void {
    this.currentFormMetrics.responseTime += time;
  }

  public startFormFilling(totalQuestions: number): void {
    this.formStartTime = Date.now();
    this.currentFormMetrics = {
      totalQuestions,
      successfulQuestions: 0,
      alreadyFilledQuestions: 0,
      toBeFilledQuestions: 0,
      responseTime: 0,
    };
  }

  public incrementTotalQuestions(count: number) {
    this.currentFormMetrics.totalQuestions += count;
  }

  public incrementSuccessfulQuestions() {
    this.currentFormMetrics.successfulQuestions++;
  }

  public incrementToBeFilledQuestions() {
    this.currentFormMetrics.toBeFilledQuestions++;
  }

  resetMetrics(): void {
    try {
      chrome.storage.sync.set(
        { [MetricsManager.STORAGE_KEY]: this.getDefaultMetrics() },
        () => {
          // noop: best-effort reset; consumers don't await this
        },
      );
    } catch {
      // swallow errors; UI will show toast if needed elsewhere
    }
  }

  public async endFormFilling(llmModel: LLMEngineType): Promise<void> {
    const timeAI = (Date.now() - this.formStartTime) / 1000;
    await this.updateMetrics({
      timeAI,
      totalQuestions: this.currentFormMetrics.totalQuestions,
      successfulQuestions: this.currentFormMetrics.successfulQuestions,
      toBeFilledQuestions: this.currentFormMetrics.toBeFilledQuestions,
      llmModel,
      responseTime: this.currentFormMetrics.responseTime,
    });
    this.currentFormMetrics = {
      totalQuestions: 0,
      successfulQuestions: 0,
      alreadyFilledQuestions: 0,
      toBeFilledQuestions: 0,
      responseTime: 0,
    };
  }

  public getCurrentFormMetrics() {
    return {
      ...this.currentFormMetrics,
      timeElapsed: (Date.now() - this.formStartTime) / 1000,
    };
  }

  async getMetrics(): Promise<MetricsData> {
    try {
      const result = await getStorageItem<MetricsData>(
        MetricsManager.STORAGE_KEY,
      );
      return result ?? this.getDefaultMetrics();
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: debugging metrics operations
      console.error('Error getting metrics:', error);
      return this.getDefaultMetrics();
    }
  }

  private getDefaultMetrics(): MetricsData {
    return {
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
  }

  async updateMetrics(params: MetricsUpdateParams): Promise<void> {
    try {
      const metrics = await this.getMetrics();
      const today = new Date().toISOString().split('T')[0] || '';

      this.updateHistoryMetrics(metrics, params, today);
      const { currentStreak, activeStreak } =
        MetricsCalculator.calculateStreaks(
          metrics.history,
          metrics.formMetrics,
        );
      metrics.formMetrics = {
        totalFormsFilled: metrics.formMetrics.totalFormsFilled + 1,
        successfulFills: metrics.formMetrics.successfulFills + 1,
        failedFills:
          metrics.formMetrics.failedFills +
          (params.toBeFilledQuestions - params.successfulQuestions),
        lastFilledDate: today,
        currentStreak,
        activeStreak,
      };
      const timeSaved = MetricsCalculator.calculateTimeSaved(metrics.history);

      metrics.timeMetrics = {
        totalHoursSaved: timeSaved.totalHours,
        totalMinSaved: timeSaved.totalMin,
        totalSecSaved: timeSaved.totalSec,
        averageTimePerForm:
          (timeSaved.totalHours * 60 * 60 +
            timeSaved.totalMin * 60 +
            timeSaved.totalSec) /
          metrics.formMetrics.totalFormsFilled,
      };

      this.updateAIMetrics(metrics, params);
      await this.saveMetrics(metrics);
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: debugging metrics operations
      console.error('Error updating metrics:', error);
      throw error;
    }
  }

  async saveMetrics(metrics: MetricsData): Promise<void> {
    try {
      await setStorageItem(MetricsManager.STORAGE_KEY, metrics);
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: debugging metrics operations
      console.error('Error saving metrics:', error);
      throw error;
    }
  }

  private updateHistoryMetrics(
    metrics: MetricsData,
    params: MetricsUpdateParams,
    today: string,
  ): void {
    const todayIndex = metrics.history.findIndex(
      (entry) => entry.date === today,
    );

    if (todayIndex !== -1) {
      metrics.history[todayIndex] = {
        ...metrics.history[todayIndex],
        date: today,
        formsFilled: (metrics.history[todayIndex]?.formsFilled ?? 0) + 1,
        timeAI: (metrics.history[todayIndex]?.timeAI ?? 0) + params.timeAI,
        totalQuestions:
          (metrics.history[todayIndex]?.totalQuestions ?? 0) +
          params.totalQuestions,
        successfulQuestions:
          (metrics.history[todayIndex]?.successfulQuestions ?? 0) +
          params.successfulQuestions,
        toBeFilledQuestions:
          (metrics.history[todayIndex]?.toBeFilledQuestions ?? 0) +
          params.toBeFilledQuestions,
      };
    } else {
      metrics.history.push({
        date: today,
        formsFilled: 1,
        timeAI: params.timeAI,
        totalQuestions: params.totalQuestions,
        successfulQuestions: params.successfulQuestions,
        toBeFilledQuestions: params.toBeFilledQuestions,
      });
    }
    metrics.history = metrics.history.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    if (metrics.history.length > MetricsManager.MAX_HISTORY_DAYS) {
      const lastKeptIndex = MetricsManager.MAX_HISTORY_DAYS - 1;
      const excessEntries = metrics.history.slice(
        MetricsManager.MAX_HISTORY_DAYS,
      );
      const accumulatedMetrics = excessEntries.reduce(
        (acc, entry) => ({
          formsFilled: (acc.formsFilled ?? 0) + (entry.formsFilled ?? 0),
          timeAI: (acc.timeAI ?? 0) + (entry.timeAI ?? 0),
          totalQuestions:
            (acc.totalQuestions ?? 0) + (entry.totalQuestions ?? 0),
          successfulQuestions:
            (acc.successfulQuestions ?? 0) + (entry.successfulQuestions ?? 0),
          toBeFilledQuestions:
            (acc.toBeFilledQuestions ?? 0) + (entry.toBeFilledQuestions ?? 0),
        }),
        {
          formsFilled: 0,
          timeAI: 0,
          totalQuestions: 0,
          successfulQuestions: 0,
          toBeFilledQuestions: 0,
        },
      );
      metrics.history[lastKeptIndex] = {
        ...metrics.history[lastKeptIndex],
        date: metrics.history[lastKeptIndex]?.date ?? '',
        formsFilled:
          (metrics.history[lastKeptIndex]?.formsFilled ?? 0) +
          accumulatedMetrics.formsFilled,
        timeAI:
          (metrics.history[lastKeptIndex]?.timeAI ?? 0) +
          accumulatedMetrics.timeAI,
        totalQuestions:
          (metrics.history[lastKeptIndex]?.totalQuestions ?? 0) +
          accumulatedMetrics.totalQuestions,
        successfulQuestions:
          (metrics.history[lastKeptIndex]?.successfulQuestions ?? 0) +
          accumulatedMetrics.successfulQuestions,
        toBeFilledQuestions:
          (metrics.history[lastKeptIndex]?.toBeFilledQuestions ?? 0) +
          accumulatedMetrics.toBeFilledQuestions,
      };

      metrics.history = metrics.history.slice(
        0,
        MetricsManager.MAX_HISTORY_DAYS,
      );
    }
    // biome-ignore lint/suspicious/noConsole: debugging metrics operations
    console.log('Metrics History : ', metrics);
  }

  private updateAIMetrics(
    metrics: MetricsData,
    params: MetricsUpdateParams,
  ): void {
    const { llmModel, responseTime } = params;
    if (!metrics.aiMetrics.apiCalls[llmModel]) {
      metrics.aiMetrics.apiCalls[llmModel] = 0;
      metrics.aiMetrics.averageResponseTime[llmModel] = 0;
    }
    metrics.aiMetrics.apiCalls[llmModel]++;

    const prevAvg = metrics.aiMetrics.averageResponseTime[llmModel];
    const prevCalls = metrics.aiMetrics.apiCalls[llmModel] - 1;
    metrics.aiMetrics.averageResponseTime[llmModel] =
      ((prevAvg ?? 0) * prevCalls + responseTime) /
      metrics.aiMetrics.apiCalls[llmModel];
  }
}
