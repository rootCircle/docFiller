import { MetricsCalculator } from '@utils/metricsCalculator';
import { MetricsManager } from '@utils/storage/metricsManager';

export class MetricsUI {
  private updateInterval: number | undefined;
  private _handlers:
    | {
        export: () => void;
        reset: () => void;
      }
    | undefined;

  public async initialize(): Promise<void> {
    const loadingEl = document.getElementById('metricsLoading');
    try {
      loadingEl?.classList.remove('hidden');
      await this.updateMetricsDisplay();
      this.setupEventListeners();
      // Update metrics every 5 seconds
      this.updateInterval = window.setInterval(() => {
        this.updateMetricsDisplay().catch((error) => {
          // biome-ignore lint/suspicious/noConsole: debugging metrics UI functionality
          console.error('Error updating metrics display:', error);
        });
      }, 5000);
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: debugging metrics UI functionality
      console.error('Failed to initialize metrics:', error);
    } finally {
      loadingEl?.classList.add('hidden');
    }
  }

  public cleanup(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    const exportBtn = document.getElementById('exportMetrics');
    const resetBtn = document.getElementById('resetMetrics');

    if (this._handlers) {
      exportBtn?.removeEventListener('click', this._handlers.export);
      resetBtn?.removeEventListener('click', this._handlers.reset);
    }
  }

  private async updateMetricsDisplay(): Promise<void> {
    try {
      const metricsManager = MetricsManager.getInstance();
      const metrics = await metricsManager.getMetrics();
      const formMetrics = MetricsCalculator.calculateFormMetrics(
        metrics.history,
      );
      const successRateMetrics = MetricsCalculator.calculateSuccessRate(
        metrics.history,
      );
      const timeSavedMetrics = MetricsCalculator.calculateTimeSaved(
        metrics.history,
      );
      const streakMetrics = MetricsCalculator.calculateStreaks(
        metrics.history,
        metrics.formMetrics,
      );
      const totalFormsEl = document.getElementById('totalFormsFilled');
      if (totalFormsEl) {
        const trendClass =
          formMetrics.weeklyTrend >= 0 ? 'positive' : 'negative';
        const trendArrow = formMetrics.weeklyTrend >= 0 ? '↑' : '↓';
        totalFormsEl.innerHTML = `
            <p class="metric-value">${formMetrics.total}</p>
            <div class="metric-trend ${trendClass}">
              ${trendArrow} ${Math.abs(formMetrics.weeklyTrend).toFixed(1)}% this week
            </div>
          `;
      }
      const successRateEl = document.getElementById('successRate');
      if (successRateEl) {
        const trendClass =
          successRateMetrics.weeklyTrend >= 0 ? 'positive' : 'negative';
        const trendArrow = successRateMetrics.weeklyTrend >= 0 ? '↑' : '↓';
        successRateEl.innerHTML = `
            <p class="metric-value">${successRateMetrics.rate.toFixed(1)}%</p>
            <div class="metric-trend ${trendClass}">
              ${trendArrow} ${Math.abs(successRateMetrics.weeklyTrend).toFixed(1)}% this week
            </div>
          `;
      }

      const timeSavedEl = document.getElementById('timeSaved');
      if (timeSavedEl) {
        const timeSavedText =
          timeSavedMetrics.totalHours > 0
            ? `${timeSavedMetrics.totalHours} h ${timeSavedMetrics.totalMin} mins`
            : timeSavedMetrics.totalMin > 0
              ? `${timeSavedMetrics.totalMin} mins ${timeSavedMetrics.totalSec} sec`
              : `${timeSavedMetrics.totalSec} sec`;
        const trendClassts =
          formMetrics.weeklyTrend >= 0 ? 'positive' : 'negative';
        const trendArrow = formMetrics.weeklyTrend >= 0 ? '↑' : '↓';
        timeSavedEl.innerHTML = `
    <p class="metric-value">${timeSavedText}</p>
    <div class="metric-trend ${trendClassts}">
      ${trendArrow} ${Math.abs(timeSavedMetrics.dailyTrend).toFixed(1)}% this week
    </div>
  `;
      }
      const activeStreakEl = document.getElementById('activeStreak');
      if (activeStreakEl) {
        activeStreakEl.innerHTML = `
            <p class="metric-value">${streakMetrics.activeStreak}</p>
            <div class="metric-trend">Current streak: ${streakMetrics.currentStreak} days</div>
          `;
      }
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: debugging metrics UI functionality
      console.error('Error updating metrics display:', error);
      const errorEl = document.getElementById('metricsError');
      if (errorEl) {
        errorEl.textContent = 'Failed to load metrics. Please try again later.';
        errorEl.classList.remove('hidden');
      }
    }
  }

  private setupEventListeners(): void {
    const exportBtn = document.getElementById('exportMetrics');
    const resetBtn = document.getElementById('resetMetrics');

    const exportHandler = () => void this.exportMetricsData();
    const resetHandler = () => void this.resetMetricsData();

    exportBtn?.addEventListener('click', exportHandler);
    resetBtn?.addEventListener('click', resetHandler);

    // window.addEventListener('formFillComplete', () => {
    //   this.updateMetricsDisplay().catch((error) => console.error('Error updating metrics display:', error));
    // });

    this._handlers = {
      export: exportHandler,
      reset: resetHandler,
    };
  }

  private async exportMetricsData(): Promise<void> {
    try {
      const metrics = await MetricsManager.getInstance().getMetrics();
      const blob = new Blob([JSON.stringify(metrics, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `docfiller-metrics-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: debugging metrics UI functionality
      console.error('Failed to export metrics:', error);
      alert('Failed to export metrics. Please try again.');
    }
  }

  private async resetMetricsData(): Promise<void> {
    if (
      confirm(
        'Are you sure you want to reset all metrics? This action cannot be undone.',
      )
    ) {
      try {
        await MetricsManager.getInstance().resetMetrics();
        await this.updateMetricsDisplay();
        alert('Metrics reset successfully!');
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: debugging metrics UI functionality
        console.error('Failed to reset metrics:', error);
        alert('Failed to reset metrics. Please try again.');
      }
    }
  }
}
