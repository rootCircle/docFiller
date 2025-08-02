// biome-ignore lint/complexity/noStaticOnlyClass: utility class with static methods for metrics calculation
export class MetricsCalculator {
  // Constants
  private static MANUAL_TIME_PER_QUESTION = 23;

  static calculateFormMetrics(metricHistory: MetricsHistory[]): {
    total: number;
    weeklyTrend: number;
  } {
    const total = metricHistory.reduce(
      (sum, entry) => sum + entry.formsFilled,
      0,
    );
    if (total === 0) {
      return { total: 0, weeklyTrend: 0 };
    }
    const today = new Date();
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - 7);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    let thisWeekForms = 0;
    let lastWeekForms = 0;
    for (const entry of metricHistory) {
      const entryDate = new Date(entry.date);
      if (entryDate >= thisWeekStart) {
        thisWeekForms += entry.formsFilled;
      } else if (entryDate >= lastWeekStart) {
        lastWeekForms += entry.formsFilled;
      }
    }
    const weeklyTrend =
      (lastWeekForms === 0
        ? 1
        : (thisWeekForms - lastWeekForms) / lastWeekForms) * 100;
    return { total, weeklyTrend };
  }

  private static calculateTimeDifference(entry: MetricsHistory): number {
    const manualTime = entry.toBeFilledQuestions
      ? entry.toBeFilledQuestions * MetricsCalculator.MANUAL_TIME_PER_QUESTION
      : entry.timeAI;
    return manualTime - entry.timeAI;
  }

  static calculateTimeSaved(metricHistory: MetricsHistory[]): {
    totalHours: number;
    totalMin: number;
    totalSec: number;
    dailyTrend: number;
  } {
    let total = metricHistory.reduce(
      (sum, entry) => sum + MetricsCalculator.calculateTimeDifference(entry),
      0,
    );
    if (total < 0) {
      total = 0;
    }
    if (MetricsCalculator.calculateFormMetrics(metricHistory).total === 0) {
      return { totalHours: 0, totalMin: 0, totalSec: 0, dailyTrend: 0 };
    }
    const totalHours = Math.floor(total / 3600);
    const totalMin = Math.floor((total % 3600) / 60);
    const totalSec = Math.floor(total % 60);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split('T')[0];
    const todayTotal = metricHistory
      .filter((entry) => entry.date === today)
      .reduce(
        (sum, entry) => sum + MetricsCalculator.calculateTimeDifference(entry),
        0,
      );
    const yesterdayTotal = metricHistory
      .filter((entry) => entry.date === yesterday)
      .reduce(
        (sum, entry) => sum + MetricsCalculator.calculateTimeDifference(entry),
        0,
      );
    const dailyTrend =
      (yesterdayTotal === 0
        ? 1
        : (todayTotal - yesterdayTotal) / yesterdayTotal) * 100;
    return { totalHours, totalMin, totalSec, dailyTrend };
  }

  static calculateStreaks(
    metricHistory: MetricsHistory[],
    formMetrics: MetricsData['formMetrics'],
  ): {
    currentStreak: number;
    activeStreak: number;
  } {
    if (!metricHistory || metricHistory.length === 0) {
      return { currentStreak: 0, activeStreak: 0 };
    }

    const sortedHistory = [...metricHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    let currentStreak = formMetrics.currentStreak;
    let activeStreak = formMetrics.activeStreak;
    if (sortedHistory[0]?.formsFilled !== 1) {
      return {
        currentStreak: formMetrics.currentStreak,
        activeStreak: formMetrics.activeStreak,
      };
    }
    if (sortedHistory.length === 1) {
      return { currentStreak: 1, activeStreak: 1 };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastEntryDate = sortedHistory[1]
      ? new Date(sortedHistory[1].date)
      : new Date();
    lastEntryDate.setHours(0, 0, 0, 0);
    if (today.getTime() - lastEntryDate.getTime() > 86400000) {
      return { currentStreak: 1, activeStreak };
    }
    currentStreak++;
    if (currentStreak > activeStreak) {
      activeStreak = currentStreak;
    }
    return { currentStreak, activeStreak };
  }

  private static calculateRateForEntries(entries: MetricsHistory[]): number {
    const successful = entries.reduce(
      (sum, entry) => sum + (entry.successfulQuestions || 0),
      0,
    );
    const hasToFill = entries.reduce(
      (sum, entry) => sum + (entry.toBeFilledQuestions || 0),
      0,
    );
    // console.log('questions, successful', questions, successful);
    return (
      (hasToFill
        ? successful / hasToFill
        : MetricsCalculator.calculateFormMetrics(entries).total > 0
          ? 1
          : 0) * 100
    );
  }

  static calculateSuccessRate(metricHistory: MetricsHistory[]): {
    rate: number;
    weeklyTrend: number;
  } {
    if (MetricsCalculator.calculateFormMetrics(metricHistory).total === 0) {
      return { rate: 0, weeklyTrend: 0 };
    }

    const rate = MetricsCalculator.calculateRateForEntries(metricHistory);
    const today = new Date();
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - 7);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    const thisWeekRate = MetricsCalculator.calculateRateForEntries(
      metricHistory.filter((entry) => new Date(entry.date) >= thisWeekStart),
    );
    const lastWeekRate = MetricsCalculator.calculateRateForEntries(
      metricHistory.filter((entry) => {
        const date = new Date(entry.date);
        return date >= lastWeekStart && date < thisWeekStart;
      }),
    );

    const weeklyTrend =
      (lastWeekRate === 0 ? 1 : (thisWeekRate - lastWeekRate) / lastWeekRate) *
      100;
    return { rate, weeklyTrend };
  }
}
