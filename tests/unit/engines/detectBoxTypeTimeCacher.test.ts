import { describe, expect, it } from 'vitest';

import { DetectBoxTypeTimeCacher } from '@docFillerCore/detectors/detectBoxTypeTimeCacher';

const buildElement = () => {
  const container = document.createElement('div');
  container.innerHTML = `
    <input aria-label="Year" />
    <input aria-label="Month" />
    <input aria-label="Day of the month" />
    <input aria-label="Hour" />
    <input aria-label="Minute" />
    <input aria-label="Seconds" />
    <div role="option" data-value="AM"></div>
  `;
  return container;
};

describe('DetectBoxTypeTimeCacher', () => {
  it('detects time components and caches results', () => {
    const cacher = new DetectBoxTypeTimeCacher();
    const element = buildElement();

    const result = cacher.getTimeParams(element);
    expect(result).toEqual([
      6,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      false,
    ]);

    // Remove month input and reuse cache without invalidation
    element
      .querySelector<HTMLInputElement>('input[aria-label="Month"]')
      ?.remove();
    const cached = cacher.getTimeParams(element, false);
    expect(cached[2]).toBe(true); // still cached as true

    const refreshed = cacher.getTimeParams(element, true);
    expect(refreshed[2]).toBe(false);
  });

  it('detects chrome date fields', () => {
    const cacher = new DetectBoxTypeTimeCacher();
    const element = document.createElement('div');
    const chromeInput = document.createElement('input');
    chromeInput.type = 'date';
    element.appendChild(chromeInput);

    const result = cacher.getTimeParams(element);
    expect(result[8]).toBe(true);
  });
});
