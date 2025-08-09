/**
 * A Cacher Engine for Date/Time based field boxes.
 * This class helps eliminate repeated DOM queries by caching results.
 * Value validation is based on the input element, not on the cached output.
 *
 * This utility class is used to detect the presence of various date/time fields
 * in a given HTML element and cache these results to improve performance.
 */
export class DetectBoxTypeTimeCacher {
  private element: HTMLElement | null = null;
  private inputFieldCount: number | null = null;
  private hasYear: boolean | null = null;
  private hasMonth: boolean | null = null;
  private hasDate: boolean | null = null;
  private hasHour: boolean | null = null;
  private hasMinute: boolean | null = null;
  private hasSecond: boolean | null = null;
  private hasMeridiemField: boolean | null = null;
  private isChromeDateField: boolean | null = null;

  public getTimeParams(
    element: HTMLElement,
    invalidateCache = true,
  ): [
    number | null,
    boolean | null,
    boolean | null,
    boolean | null,
    boolean | null,
    boolean | null,
    boolean | null,
    boolean | null,
    boolean | null,
  ] {
    if (element !== this.element || invalidateCache) {
      this.element = element;
      this.inputFieldCount = element.querySelectorAll('input').length;
      // Special handling for Chrome date fields, as there is different behavior in Chrome and Firefox.
      this.isChromeDateField = Boolean(
        element.querySelector('input[type=date]'),
      );

      this.hasYear = Boolean(element.querySelector('input[aria-label="Year"]'));
      this.hasMonth = Boolean(
        element.querySelector('input[aria-label="Month"]'),
      );
      this.hasDate = Boolean(
        element.querySelector('input[aria-label="Day of the month"]'),
      );
      this.hasHour = Boolean(element.querySelector('input[aria-label="Hour"]'));
      this.hasMinute = Boolean(
        element.querySelector('input[aria-label="Minute"]'),
      );
      this.hasSecond = Boolean(
        element.querySelector('input[aria-label="Seconds"]'),
      );
      this.hasMeridiemField = Boolean(
        element.querySelector('div[role=option][data-value=AM]'),
      );
    }

    return [
      this.inputFieldCount,
      this.hasYear,
      this.hasMonth,
      this.hasDate,
      this.hasHour,
      this.hasMinute,
      this.hasSecond,
      this.hasMeridiemField,
      this.isChromeDateField,
    ];
  }
}
